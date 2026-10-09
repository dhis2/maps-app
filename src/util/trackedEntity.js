import { TEI_CLIENT_PAGE_SIZE } from '../constants/layers.js'
import {
    ORG_UNIT_MODE_CHILDREN,
    ORG_UNIT_MODE_DESCENDANTS,
    ORG_UNIT_MODE_SELECTED,
} from '../constants/orgUnits.js'
import { getOrgUnitsFromRows } from './analytics.js'
import {
    GEO_TYPE_FEATURE,
    parseWkt,
    trackedEntityGeometryTypes,
} from './geojson.js'
import { trimTime } from './time.js'
import {
    serverSupportsTracker41Api,
    serverSupportsTrackedEntityAnalytics,
    serverSupportsTrackedEntityAnalyticsIdColumn,
    serverSupportsTrackerEnrollmentStatus,
} from './versionToggle.js'

export const TRACKED_ENTITY_TRACKED_ENTITY_TYPE_ATTRIBUTES_QUERY = {
    trackedEntityType: {
        resource: 'trackedEntityTypes',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: `trackedEntityTypeAttributes[displayInList,trackedEntityAttribute[id,${nameProperty}~rename(name),optionSet,valueType]]`,
            paging: false,
        }),
    },
}

export const TRACKED_ENTITY_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY = {
    program: {
        resource: 'programs',
        id: ({ id }) => id,
        params: ({ nameProperty }) => ({
            fields: `programTrackedEntityAttributes[displayInList,trackedEntityAttribute[id,${nameProperty}~rename(name),optionSet,valueType]]`,
            paging: false,
        }),
    },
}

// Org unit mode used when the layer has none: all levels below on 2.41+,
// the selected org units only on 2.40
// VERSION-TOGGLE: see util/versionToggle.js
export const getTrackedEntityDefaultOrgUnitMode = (serverVersion) =>
    serverSupportsTrackedEntityAnalytics(serverVersion)
        ? ORG_UNIT_MODE_DESCENDANTS
        : ORG_UNIT_MODE_SELECTED

// Tracker API
// -----

// Row limit of the tracker API, applied even with paging off
// VERSION-TOGGLE: KeyTrackedEntityInstanceMaxLimit deprecated in 2.41 for
// KeyTrackedEntityMaxLimit, which 2.41+ servers apply
export const getTrackerMaxLimit = (systemSettings, serverVersion) => {
    const limit = Number(
        serverSupportsTracker41Api(serverVersion)
            ? systemSettings.KeyTrackedEntityMaxLimit
            : systemSettings.KeyTrackedEntityInstanceMaxLimit
    )
    return limit > 0 ? limit : null
}

const fields = ['trackedEntity~rename(id)', 'geometry']

const TEI_40_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
    }) => ({
        fields,
        orgUnit: orgUnits,
        ouMode: orgUnitMode,
        program: program,
        programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        skipPaging: true,
    }),
}

const TEI_41_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        isEnrollmentStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
    }) => ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        [isEnrollmentStatus ? 'enrollmentStatus' : 'programStatus']:
            programStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

export const createTrackedEntityInstanceFeatures = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

const ORG_UNIT_CHILDREN_QUERY = {
    resource: 'organisationUnits',
    params: ({ parents }) => ({
        fields: 'id',
        filter: `parent.id:in:[${parents.join(',')}]`,
        paging: false,
    }),
}

// The tracker API's CHILDREN mode includes the selected org units, unlike
// analytics, so the children are requested in SELECTED mode instead
const getTrackerOrgUnits = async ({ engine, orgUnitIds, orgUnitMode }) => {
    if (orgUnitMode !== ORG_UNIT_MODE_CHILDREN) {
        return { orgUnitIds, orgUnitMode }
    }

    const { children } = await engine.query(
        { children: ORG_UNIT_CHILDREN_QUERY },
        { variables: { parents: orgUnitIds } }
    )

    return {
        orgUnitIds: children.organisationUnits.map(({ id }) => id),
        orgUnitMode: ORG_UNIT_MODE_SELECTED,
    }
}

const buildQueryVariables = ({
    fields,
    orgUnits,
    orgUnitMode,
    program,
    programStatus,
    followUp,
    trackedEntityType,
    periodType,
    startDate,
    endDate,
}) => {
    // Program status, follow-up and enrollment dates only apply to a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'

    return {
        fields,
        orgUnits,
        orgUnitMode,
        program: program?.id,
        programStatus: program ? programStatus : undefined,
        // Unchecked means no filter, not "not marked for follow-up"
        followUp: program && followUp ? 'TRUE' : undefined,
        trackedEntityType: program ? undefined : trackedEntityType?.id,
        enrollmentEnrolledAfter: isEnrollmentPeriod
            ? trimTime(startDate)
            : undefined,
        enrollmentEnrolledBefore: isEnrollmentPeriod
            ? trimTime(endDate)
            : undefined,
        updatedAfter: isEnrollmentPeriod ? undefined : trimTime(startDate),
        updatedBefore: isEnrollmentPeriod ? undefined : trimTime(endDate),
    }
}

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
    maxLimit,
}) => {
    const {
        trackedEntityType,
        program,
        programStatus,
        followUp,
        periodType,
        startDate,
        endDate,
        rows,
        organisationUnitSelectionMode,
        relationshipType,
    } = config

    // VERSION-TOGGLE: see util/versionToggle.js
    const isVersion40 = !serverSupportsTracker41Api(serverVersion)

    const { orgUnitIds, orgUnitMode } = await getTrackerOrgUnits({
        engine,
        orgUnitIds: getOrgUnitsFromRows(rows).map((ou) => ou.id),
        orgUnitMode: organisationUnitSelectionMode,
    })
    const orgUnits = orgUnitIds.join(isVersion40 ? ';' : ',')

    // Without org units, the tracker API would use all accessible ones
    if (!orgUnitIds.length) {
        return {
            data: [],
            instances: [],
            orgUnits,
            orgUnitMode,
            isTruncated: false,
            limit: maxLimit,
        }
    }

    // Slow to fetch, so only for layers showing relationships
    const requestFields = relationshipType
        ? [...fields, 'relationships']
        : fields

    const { trackedEntities } = await engine.query(
        { trackedEntities: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY },
        {
            variables: {
                ...buildQueryVariables({
                    fields: requestFields,
                    orgUnits,
                    orgUnitMode,
                    program,
                    programStatus,
                    followUp,
                    trackedEntityType,
                    periodType,
                    startDate,
                    endDate,
                }),
                // VERSION-TOGGLE: see util/versionToggle.js
                isEnrollmentStatus:
                    serverSupportsTrackerEnrollmentStatus(serverVersion),
            },
        }
    )

    const allInstances =
        trackedEntities[isVersion40 ? 'instances' : 'trackedEntities']
    const instances = allInstances.filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    return {
        data: createTrackedEntityInstanceFeatures(instances),
        instances,
        // Org units and mode for the relationships request
        orgUnits,
        orgUnitMode,
        // The API returns at most maxLimit rows and no total, so reaching the
        // limit is the only sign of a cut (a total of exactly maxLimit also
        // warns). All rows count, geometry or not
        isTruncated: Boolean(maxLimit) && allInstances.length >= maxLimit,
        limit: maxLimit,
    }
}

// Tracker analytics (2.41+)
// -----

// Tracker analytics can't return relationships or filter by follow-up
export const canLoadTrackedEntitiesFromAnalytics = (
    { program, followUp, relationshipType },
    serverVersion
) =>
    // VERSION-TOGGLE: see util/versionToggle.js
    serverSupportsTrackedEntityAnalytics(serverVersion) &&
    !relationshipType &&
    !(program && followUp)

// VERSION-TOGGLE: see util/versionToggle.js
const getAnalyticsIdColumn = (serverVersion) =>
    serverSupportsTrackedEntityAnalyticsIdColumn(serverVersion)
        ? 'trackedentity'
        : 'trackedentityinstanceuid'

export const getTrackedEntityAnalyticsRequest = (
    {
        trackedEntityType,
        program,
        programStatus,
        periodType,
        startDate,
        endDate,
        rows,
        organisationUnitSelectionMode,
    },
    { analyticsEngine, serverVersion }
) => {
    // Same rules as the tracker request: program filters need a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'
    const range = `${trimTime(startDate)}_${trimTime(endDate)}`

    const request = new analyticsEngine.request()
        .withTrackedEntityType(trackedEntityType.id)
        .addOrgUnitDimension(getOrgUnitsFromRows(rows).map((ou) => ou.id))
        .withOuMode(organisationUnitSelectionMode)

    // withProgram() would put the program in the path
    return request.withParameters({
        // Every attribute and org unit column comes back otherwise
        headers: `${getAnalyticsIdColumn(serverVersion)},geometry`,
        // coordinatesOnly would exclude polygons
        geometryOnly: true,
        ...(program && { program: program.id }),
        ...(program &&
            programStatus && {
                enrollmentStatus: `${program.id}.${programStatus}`,
            }),
        ...(isEnrollmentPeriod
            ? { enrollmentDate: `${program.id}.${range}` }
            : { lastUpdated: range }),
    })
}

export const createTrackedEntityFeatures = (
    { headers, rows },
    serverVersion
) => {
    const idCol = headers.findIndex(
        (header) => header.name === getAnalyticsIdColumn(serverVersion)
    )
    const geomCol = headers.findIndex((header) => header.name === 'geometry')

    return rows.reduce((features, row) => {
        const geometry = parseWkt(row[geomCol])

        if (geometry) {
            features.push({
                type: GEO_TYPE_FEATURE,
                geometry,
                properties: { id: row[idCol] },
            })
        }

        return features
    }, [])
}

export const loadTrackedEntitiesFromAnalytics = async ({
    config,
    analyticsEngine,
    serverVersion,
    pageSize = TEI_CLIENT_PAGE_SIZE,
}) => {
    const request = getTrackedEntityAnalyticsRequest(config, {
        analyticsEngine,
        serverVersion,
    })
    const response = await analyticsEngine.trackedEntities.getQuery(
        request.withPageSize(pageSize).withParameters({ totalPages: true })
    )
    const total = response.metaData?.pager?.total
    const count = response.rows.length

    return {
        data: createTrackedEntityFeatures(response, serverVersion),
        // The server can return fewer rows than pageSize (analytics max limit)
        isTruncated: total > count,
        limit: count,
        total,
    }
}
