import { TEI_CLIENT_PAGE_SIZE } from '../constants/layers.js'
import {
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
} from './versionToggle.js'

// Attribute queries (used by the layer popup)
// -----

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

// Filters
// -----

// VERSION-TOGGLE: each API's own default - see util/versionToggle.js
export const getTrackedEntityDefaultOrgUnitMode = (serverVersion) =>
    serverSupportsTrackedEntityAnalytics(serverVersion)
        ? ORG_UNIT_MODE_DESCENDANTS
        : ORG_UNIT_MODE_SELECTED

// Tracker analytics can't return relationships or filter by follow-up
export const canLoadTrackedEntitiesFromAnalytics = (
    { program, followUp, relationshipType },
    serverVersion
) =>
    // VERSION-TOGGLE: see util/versionToggle.js
    serverSupportsTrackedEntityAnalytics(serverVersion) &&
    !relationshipType &&
    !(program && followUp)

// Filters shared by the analytics and tracker requests
const getTrackedEntityFilters = ({
    trackedEntityType,
    program,
    programStatus,
    followUp,
    periodType,
    startDate,
    endDate,
    rows,
    organisationUnitSelectionMode,
}) => {
    const isEnrollmentPeriod = periodType === 'program'

    return {
        trackedEntityTypeId: trackedEntityType.id,
        programId: program?.id,
        // Program-scoped filters are ignored without a program
        programStatus: program ? programStatus : undefined,
        // Unchecked means no filter, not "not marked for follow-up"
        followUp: Boolean(program && followUp),
        orgUnitIds: getOrgUnitsFromRows(rows).map((ou) => ou.id),
        orgUnitMode: organisationUnitSelectionMode,
        period:
            startDate && endDate && (program || !isEnrollmentPeriod)
                ? {
                      isEnrollmentPeriod,
                      startDate: trimTime(startDate),
                      endDate: trimTime(endDate),
                  }
                : undefined,
    }
}

// Analytics (2.41+)
// -----

// VERSION-TOGGLE: see util/versionToggle.js
const getAnalyticsIdColumn = (serverVersion) =>
    serverSupportsTrackedEntityAnalyticsIdColumn(serverVersion)
        ? 'trackedentity'
        : 'trackedentityinstanceuid'

export const getTrackedEntityAnalyticsRequest = (
    config,
    { analyticsEngine, serverVersion }
) => {
    const {
        trackedEntityTypeId,
        programId,
        programStatus,
        orgUnitIds,
        orgUnitMode,
        period,
    } = getTrackedEntityFilters(config)

    let request = new analyticsEngine.request()
        .withTrackedEntityType(trackedEntityTypeId)
        .addOrgUnitDimension(orgUnitIds)

    if (orgUnitMode) {
        request = request.withOuMode(orgUnitMode)
    }

    // withProgram() would put the program in the path. Date params are top-level
    // and enrollment ones are qualified with the program: "<program>.<period>"
    const range = period && `${period.startDate}_${period.endDate}`

    return request.withParameters({
        // Every attribute and org unit column comes back otherwise
        headers: `${getAnalyticsIdColumn(serverVersion)},geometry`,
        // coordinatesOnly would exclude polygons
        geometryOnly: true,
        ...(programId && { program: programId }),
        ...(programStatus && {
            programStatus: `${programId}.${programStatus}`,
        }),
        ...(period &&
            (period.isEnrollmentPeriod
                ? { enrollmentDate: `${programId}.${range}` }
                : { lastUpdated: range })),
    })
}

export const createTrackedEntityFeatures = (
    { headers, rows },
    serverVersion
) => {
    const idColName = getAnalyticsIdColumn(serverVersion)
    const idCol = headers.findIndex((h) => h.name === idColName)
    const geomCol = headers.findIndex((h) => h.name === 'geometry')

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
        request.withPageSize(pageSize)
    )

    return {
        data: createTrackedEntityFeatures(response, serverVersion),
        // isLastPage is false for empty results, and the server can return fewer
        // rows than pageSize (analytics max limit setting)
        isTruncated:
            response.metaData?.pager?.isLastPage === false &&
            response.rows.length > 0,
        limit: pageSize,
    }
}

// Tracker API (2.40, relationships and follow-up)
// -----

// Row limit of the tracker API, applied even with paging off
// VERSION-TOGGLE: setting renamed in 2.41 - see util/versionToggle.js
export const getTrackerMaxLimit = (systemSettings = {}, serverVersion) => {
    const limit = Number(
        serverSupportsTracker41Api(serverVersion)
            ? systemSettings.KeyTrackedEntityMaxLimit
            : systemSettings.KeyTrackedEntityInstanceMaxLimit
    )
    return limit > 0 ? limit : null
}

const TRACKER_FIELDS = ['trackedEntity~rename(id)', 'geometry']
// Expensive, so only for layers showing relationships
const TRACKER_RELATIONSHIP_FIELDS = [...TRACKER_FIELDS, 'relationships']

const TRACKED_ENTITIES_QUERY = {
    resource: 'tracker/trackedEntities',
    params: (params) => params,
}

const getTrackerParams = (filters, isTracker41Api, withRelationships) => {
    const {
        trackedEntityTypeId,
        programId,
        programStatus,
        followUp,
        orgUnitIds,
        orgUnitMode,
        period,
    } = filters

    const versionParams = isTracker41Api
        ? {
              orgUnits: orgUnitIds.join(','),
              orgUnitMode,
              paging: false,
          }
        : {
              orgUnit: orgUnitIds.join(';'),
              ouMode: orgUnitMode,
              skipPaging: true,
          }

    let periodParams = {}

    if (period?.isEnrollmentPeriod) {
        periodParams = {
            enrollmentEnrolledAfter: period.startDate,
            enrollmentEnrolledBefore: period.endDate,
        }
    } else if (period) {
        periodParams = {
            updatedAfter: period.startDate,
            updatedBefore: period.endDate,
        }
    }

    return {
        fields: withRelationships
            ? TRACKER_RELATIONSHIP_FIELDS
            : TRACKER_FIELDS,
        program: programId,
        programStatus,
        // The tracker API doesn't accept both program and type
        trackedEntityType: programId ? undefined : trackedEntityTypeId,
        ...(followUp && { followUp: 'TRUE' }),
        ...versionParams,
        ...periodParams,
    }
}

export const createTrackedEntityInstanceFeatures = (instances) =>
    instances.map(({ id, geometry }) => ({
        type: GEO_TYPE_FEATURE,
        geometry,
        properties: { id },
    }))

export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
    maxLimit,
}) => {
    // VERSION-TOGGLE: see util/versionToggle.js
    const isTracker41Api = serverSupportsTracker41Api(serverVersion)
    const params = getTrackerParams(
        getTrackedEntityFilters(config),
        isTracker41Api,
        Boolean(config.relationshipType)
    )

    const { trackedEntities: response } = await engine.query(
        { trackedEntities: TRACKED_ENTITIES_QUERY },
        { variables: params }
    )

    const allInstances =
        response[isTracker41Api ? 'trackedEntities' : 'instances']
    const instances = allInstances.filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    return {
        data: createTrackedEntityInstanceFeatures(instances),
        // No truncation flag from the API: count all rows, geometry or not
        isTruncated: Boolean(maxLimit) && allInstances.length >= maxLimit,
        limit: maxLimit,
        instances,
        // Formatted for the relationships request
        orgUnits: isTracker41Api ? params.orgUnits : params.orgUnit,
    }
}
