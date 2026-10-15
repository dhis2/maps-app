import { TEI_CLIENT_PAGE_SIZE } from '../constants/layers.js'
import { ORG_UNIT_MODE_SELECTED } from '../constants/orgUnits.js'
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

// Features from tracked entities with an id and a geometry
export const createTrackedEntityFeatures = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: {
            id,
        },
    }))

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

// Also used for the related tracked entities of relationship layers
export const TEI_40_QUERY = {
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

export const TEI_41_QUERY = {
    resource: 'tracker/trackedEntities',
    params: ({
        fields,
        orgUnits,
        orgUnitMode,
        program,
        programStatus,
        enrollmentStatus,
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
        programStatus,
        enrollmentStatus,
        followUp,
        trackedEntityType,
        enrollmentEnrolledAfter,
        enrollmentEnrolledBefore,
        updatedAfter,
        updatedBefore,
        paging: false,
    }),
}

const getTrackerRequest = (
    {
        program,
        programStatus,
        followUp,
        trackedEntityType,
        periodType,
        startDate,
        endDate,
    },
    { fields, orgUnitIds, orgUnitMode, serverVersion }
) => {
    // VERSION-TOGGLE: see util/versionToggle.js
    const isVersion40 = !serverSupportsTracker41Api(serverVersion)
    // Program status, follow-up and enrollment dates only apply to a program
    const isEnrollmentPeriod = Boolean(program) && periodType === 'program'
    // VERSION-TOGGLE: see util/versionToggle.js
    const statusParam = serverSupportsTrackerEnrollmentStatus(serverVersion)
        ? 'enrollmentStatus'
        : 'programStatus'

    return {
        query: isVersion40 ? TEI_40_QUERY : TEI_41_QUERY,
        variables: {
            fields,
            orgUnits: orgUnitIds.join(isVersion40 ? ';' : ','),
            orgUnitMode,
            program: program?.id,
            [statusParam]: program ? programStatus : undefined,
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
        },
    }
}

// All tracked entities of the response, with or without geometry
// VERSION-TOGGLE: see util/versionToggle.js
const getTrackerRows = (response, serverVersion) =>
    response[
        serverSupportsTracker41Api(serverVersion)
            ? 'trackedEntities'
            : 'instances'
    ]

// Tracked entities with a geometry that can be drawn
const getTrackerInstances = (response, serverVersion) =>
    getTrackerRows(response, serverVersion).filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
    maxLimit,
}) => {
    // Slow to fetch, so only for layers showing relationships
    const requestFields = config.relationshipType
        ? [...fields, 'relationships']
        : fields

    const { query, variables } = getTrackerRequest(config, {
        fields: requestFields,
        orgUnitIds: getOrgUnitsFromRows(config.rows).map((ou) => ou.id),
        orgUnitMode: config.organisationUnitSelectionMode,
        serverVersion,
    })
    const { trackedEntities: response } = await engine.query(
        { trackedEntities: query },
        { variables }
    )
    const rowCount = getTrackerRows(response, serverVersion).length
    const instances = getTrackerInstances(response, serverVersion)

    return {
        data: createTrackedEntityFeatures(instances),
        instances,
        // orgUnits is formatted for the relationships request
        orgUnits: variables.orgUnits,
        // The API returns at most maxLimit rows and no total, so reaching the
        // limit is the only sign of a cut (a total of exactly maxLimit also
        // warns). All rows count, geometry or not
        isTruncated: Boolean(maxLimit) && rowCount >= maxLimit,
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

const getAnalyticsRequest = (
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
        // Analytics defaults to all levels below, the tracker API to selected
        .withOuMode(organisationUnitSelectionMode || ORG_UNIT_MODE_SELECTED)

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

// Tracked entities with a geometry that can be drawn
const getAnalyticsInstances = ({ headers, rows }, serverVersion) => {
    const idCol = headers.findIndex(
        (header) => header.name === getAnalyticsIdColumn(serverVersion)
    )
    const geomCol = headers.findIndex((header) => header.name === 'geometry')

    return rows.reduce((instances, row) => {
        const geometry = parseWkt(row[geomCol])

        if (geometry) {
            instances.push({ id: row[idCol], geometry })
        }

        return instances
    }, [])
}

export const loadTrackedEntitiesFromAnalytics = async ({
    config,
    analyticsEngine,
    serverVersion,
    pageSize = TEI_CLIENT_PAGE_SIZE,
}) => {
    const request = getAnalyticsRequest(config, {
        analyticsEngine,
        serverVersion,
    })
    const response = await analyticsEngine.trackedEntities.getQuery(
        request.withPageSize(pageSize).withParameters({ totalPages: true })
    )
    const rowCount = response.rows.length
    const instances = getAnalyticsInstances(response, serverVersion)
    const total = response.metaData?.pager?.total

    return {
        data: createTrackedEntityFeatures(instances),
        instances,
        // The server can return fewer rows than pageSize (analytics max limit)
        isTruncated: total > rowCount,
        limit: rowCount,
        total,
    }
}
