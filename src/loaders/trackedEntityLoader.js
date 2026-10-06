import i18n from '@dhis2/d2-i18n'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
} from '../constants/layers.js'
import { getProgramStatuses } from '../constants/programStatuses.js'
import { GEO_TYPE_POINT, GEO_TYPE_LINE } from '../util/geojson.js'
import {
    createErrorAlert,
    createLayerAlert,
    getErrorDetails,
} from '../util/layerAlerts.js'
import { formatWithSeparator } from '../util/numbers.js'
import { formatStartEndDate, getDateArray } from '../util/time.js'
import {
    canLoadTrackedEntitiesFromAnalytics,
    getTrackedEntityDefaultOrgUnitMode,
    getTrackerMaxLimit,
    loadTrackedEntitiesFromAnalytics,
    loadTrackedEntitiesFromTracker,
} from '../util/trackedEntity.js'
import { loadTrackedEntityRelationships } from '../util/trackedEntityRelationships.js'

export const parseJsonConfig = (config) => {
    if (!config.config || typeof config.config !== 'string') {
        return
    }

    try {
        const { relationships, periodType } = JSON.parse(config.config)

        if (relationships) {
            config.relationshipType = relationships.type
            config.relatedPointColor = relationships.pointColor
            config.relatedPointRadius = relationships.pointRadius
            config.relationshipLineColor = relationships.lineColor
            config.relationshipOutsideProgram =
                relationships.relationshipOutsideProgram
        }

        config.periodType = periodType
    } catch (e) {
        // Malformed config JSON
    }

    delete config.config
}

const getRelationshipLegendItems = ({
    relationshipType,
    relatedEntityType,
    relatedPointColor,
    relatedPointRadius,
    relationshipLineColor,
}) => {
    const isPoint =
        relatedEntityType.featureType === GEO_TYPE_POINT.toUpperCase()

    return [
        {
            type: GEO_TYPE_LINE,
            name: relationshipType.displayName,
            color: relationshipLineColor || TEI_RELATIONSHIP_LINE_COLOR,
            weight: 1,
        },
        {
            name: `${relatedEntityType.displayName} (${i18n.t('related')})`,
            color: relatedPointColor || TEI_RELATED_COLOR,
            radius: isPoint
                ? relatedPointRadius || TEI_RELATED_RADIUS
                : undefined,
            weight: isPoint ? undefined : 1,
        },
    ]
}

// Analytics can't be used, but the tracker API can: the type has no events
// or its tables were never generated (E7144), or the user can't view event
// analytics (E7217)
const ANALYTICS_FALLBACK_CODES = new Set(['E7144', 'E7217'])

// Analytics (E7...) and tracker API (E1...) codes. No access and deleted look
// the same: both say "does not exist"
const ERROR_CODES = {
    E7129: 'PROGRAM_UNAVAILABLE',
    E1003: 'PROGRAM_UNAVAILABLE',
    E7125: 'TRACKED_ENTITY_TYPE_UNAVAILABLE',
    E7120: 'ORG_UNITS_UNAVAILABLE',
    E7143: 'ORG_UNITS_UNAVAILABLE',
}

const ANALYTICS_REQUEST = 'analytics/trackedEntities/query'
const TRACKER_REQUEST = 'tracker/trackedEntities'

// Adds the failed request to the error, for the alert details
const addRequest = (error, request) => {
    if (error instanceof Object) {
        error.request ??= request
    }
    return error
}

// Tracker analytics where possible, otherwise the tracker API
const loadTrackedEntities = async ({
    config,
    engine,
    analyticsEngine,
    serverVersion,
    maxLimit,
}) => {
    if (canLoadTrackedEntitiesFromAnalytics(config, serverVersion)) {
        try {
            return await loadTrackedEntitiesFromAnalytics({
                config,
                analyticsEngine,
                serverVersion,
            })
        } catch (error) {
            if (!ANALYTICS_FALLBACK_CODES.has(error.details?.errorCode)) {
                throw addRequest(error, ANALYTICS_REQUEST)
            }
        }
    }
    return loadTrackedEntitiesFromTracker({
        config,
        engine,
        serverVersion,
        maxLimit,
    }).catch((error) => {
        throw addRequest(error, TRACKER_REQUEST)
    })
}

const createLegend = ({
    name,
    trackedEntityType,
    program,
    programStatus,
    startDate,
    endDate,
    eventPointColor,
    eventPointRadius,
    areaRadius,
}) => ({
    title: name,
    period: formatStartEndDate(getDateArray(startDate), getDateArray(endDate)),
    items: [
        {
            name:
                trackedEntityType.name +
                (areaRadius ? ` + ${areaRadius} ${'m'} ${'buffer'}` : ''),
            color: eventPointColor || TEI_COLOR,
            radius: eventPointRadius || TEI_RADIUS,
        },
    ],
    ...(program &&
        programStatus && {
            explanation: [
                `${i18n.t('Program status')}: ${
                    getProgramStatuses().find((s) => s.id === programStatus)
                        ?.name ?? programStatus
                }`,
            ],
        }),
})

const trackedEntityLoader = async ({
    config,
    engine,
    analyticsEngine,
    keyAnalysisDigitGroupSeparator,
    serverVersion,
    KeyTrackedEntityInstanceMaxLimit,
    KeyTrackedEntityMaxLimit,
}) => {
    parseJsonConfig(config)

    const {
        program,
        relationshipType: relationshipTypeID,
        organisationUnitSelectionMode,
    } = config
    const name = program?.name || i18n.t('Tracked entity')
    const alerts = []
    const loadConfig = {
        ...config,
        organisationUnitSelectionMode:
            organisationUnitSelectionMode ||
            getTrackedEntityDefaultOrgUnitMode(serverVersion),
    }
    let data = []
    let legend, relationships, secondaryData

    try {
        legend = createLegend({ ...config, name })

        const result = await loadTrackedEntities({
            config: loadConfig,
            engine,
            analyticsEngine,
            serverVersion,
            maxLimit: getTrackerMaxLimit(
                { KeyTrackedEntityInstanceMaxLimit, KeyTrackedEntityMaxLimit },
                serverVersion
            ),
        })
        data = result.data

        if (relationshipTypeID) {
            // The tracked entities are still shown when this fails
            const relationshipResult = await loadTrackedEntityRelationships({
                config: loadConfig,
                engine,
                serverVersion,
                instances: result.instances,
                orgUnits: result.orgUnits,
            }).catch((error) => {
                alerts.push(
                    createLayerAlert(
                        'RELATIONSHIPS_FAILED',
                        {},
                        getErrorDetails(error)
                    )
                )
                return null
            })

            if (relationshipResult) {
                ;({ data, relationships, secondaryData } = relationshipResult)
                legend.items.push(
                    ...getRelationshipLegendItems({
                        ...config,
                        ...relationshipResult,
                    })
                )
            }
        }

        if (result.isTruncated) {
            alerts.push(
                createLayerAlert('TRACKED_ENTITIES_TRUNCATED', {
                    limit: formatWithSeparator(
                        result.limit,
                        keyAnalysisDigitGroupSeparator
                    ),
                })
            )
        }

        if (!data.length) {
            alerts.push(createLayerAlert('NO_DATA'))
        }
    } catch (error) {
        alerts.push(createErrorAlert(error, { errorCodes: ERROR_CODES }))
    }

    return {
        ...config,
        name,
        data,
        keyAnalysisDigitGroupSeparator,
        relationships,
        secondaryData,
        legend,
        alerts,
        // The config can still have the previous load's error
        loadError: undefined,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
    }
}

export default trackedEntityLoader
