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

// VERSION-TOGGLE: follows the API default - tracker analytics includes all org
// units below the selected ones (like Line Listing), while the 2.40 tracker API
// doesn't - see util/versionToggle.js
export const getTrackedEntityDefaultOrgUnitMode = (serverVersion) =>
    serverSupportsTrackedEntityAnalytics(serverVersion)
        ? ORG_UNIT_MODE_DESCENDANTS
        : ORG_UNIT_MODE_SELECTED

// Tracker analytics can't return relationships or filter by follow-up, so the
// tracker API is used for those
export const canLoadTrackedEntitiesFromAnalytics = (
    { program, followUp, relationshipType },
    serverVersion
) =>
    // VERSION-TOGGLE: no analytics endpoint on 2.40 - see util/versionToggle.js
    serverSupportsTrackedEntityAnalytics(serverVersion) &&
    !relationshipType &&
    !(program && followUp)

// Layer config => filters shared by the analytics and tracker requests, so both
// APIs apply the same rules. Each loader maps them to its own param names.
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

export const getTrackedEntityAnalyticsRequest = (
    config,
    { analyticsEngine }
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

    // Program is a query param here: withProgram() would add it to the path.
    // Date params are top-level, not dimensions/filters, and enrollment-scoped
    // params are qualified with the program: "<program>.<period>".
    const range = period && `${period.startDate}_${period.endDate}`

    return request.withParameters({
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
    // VERSION-TOGGLE: see util/versionToggle.js
    const idColName = serverSupportsTrackedEntityAnalyticsIdColumn(
        serverVersion
    )
        ? 'trackedentity'
        : 'trackedentityinstanceuid'
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
    })
    const response = await analyticsEngine.trackedEntities.getQuery(
        request.withPageSize(pageSize)
    )

    return {
        data: createTrackedEntityFeatures(response, serverVersion),
        // isLastPage is false for empty results, so also check the page is full
        isTruncated:
            response.metaData?.pager?.isLastPage === false &&
            response.rows.length >= pageSize,
    }
}

// Tracker API (2.40 and relationships)
// -----

const TRACKER_FIELDS = ['trackedEntity~rename(id)', 'geometry', 'relationships']

const TRACKED_ENTITIES_QUERY = {
    resource: 'tracker/trackedEntities',
    params: (params) => params,
}

const getTrackerParams = (filters, isTracker41Api) => {
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

    const periodParams = period
        ? period.isEnrollmentPeriod
            ? {
                  enrollmentEnrolledAfter: period.startDate,
                  enrollmentEnrolledBefore: period.endDate,
              }
            : {
                  updatedAfter: period.startDate,
                  updatedBefore: period.endDate,
              }
        : {}

    return {
        fields: TRACKER_FIELDS,
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

// Instances include the relationships analytics can't return
export const loadTrackedEntitiesFromTracker = async ({
    config,
    engine,
    serverVersion,
}) => {
    // VERSION-TOGGLE: see util/versionToggle.js
    const isTracker41Api = serverSupportsTracker41Api(serverVersion)
    const params = getTrackerParams(
        getTrackedEntityFilters(config),
        isTracker41Api
    )

    const { trackedEntities: response } = await engine.query(
        { trackedEntities: TRACKED_ENTITIES_QUERY },
        { variables: params }
    )

    const instances = response[
        isTracker41Api ? 'trackedEntities' : 'instances'
    ].filter(
        (instance) =>
            trackedEntityGeometryTypes.has(instance.geometry?.type) &&
            instance.geometry?.coordinates
    )

    return {
        data: createTrackedEntityInstanceFeatures(instances),
        instances,
        // Formatted for the relationships request
        orgUnits: isTracker41Api ? params.orgUnits : params.orgUnit,
    }
}
