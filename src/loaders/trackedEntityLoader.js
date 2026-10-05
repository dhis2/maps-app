import i18n from '@dhis2/d2-i18n'
import {
    CUSTOM_ALERT,
    ERROR_CRITICAL,
    WARNING_NO_DATA,
} from '../constants/alerts.js'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
} from '../constants/layers.js'
import { getProgramStatuses } from '../constants/programStatuses.js'
import { GEO_TYPE_POINT, GEO_TYPE_LINE } from '../util/geojson.js'
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
        trackedEntityType,
        program,
        programStatus,
        relationshipType: relationshipTypeID,
        startDate,
        endDate,
        organisationUnitSelectionMode,
        eventPointColor,
        eventPointRadius,
        areaRadius,
    } = config

    // Legend skeleton
    // -----

    const name = program ? program.name : i18n.t('Tracked entity')

    const legend = {
        title: name,
        period: formatStartEndDate(
            getDateArray(startDate),
            getDateArray(endDate)
        ),
        items: [
            {
                name:
                    trackedEntityType.name +
                    (areaRadius ? ` + ${areaRadius} ${'m'} ${'buffer'}` : ''),
                color: eventPointColor || TEI_COLOR,
                radius: eventPointRadius || TEI_RADIUS,
            },
        ],
    }

    if (program && programStatus) {
        legend.explanation = [
            `${i18n.t('Program status')}: ${
                getProgramStatuses().find((s) => s.id === programStatus).name
            }`,
        ]
    }

    // Data loading
    // -----

    const alerts = []
    const loadConfig = {
        ...config,
        organisationUnitSelectionMode:
            organisationUnitSelectionMode ||
            getTrackedEntityDefaultOrgUnitMode(serverVersion),
    }
    let data = []
    let relationships, secondaryData, loadError

    try {
        const result = canLoadTrackedEntitiesFromAnalytics(
            loadConfig,
            serverVersion
        )
            ? await loadTrackedEntitiesFromAnalytics({
                  config: loadConfig,
                  analyticsEngine,
                  serverVersion,
              })
            : await loadTrackedEntitiesFromTracker({
                  config: loadConfig,
                  engine,
                  serverVersion,
                  maxLimit: getTrackerMaxLimit(
                      {
                          KeyTrackedEntityInstanceMaxLimit,
                          KeyTrackedEntityMaxLimit,
                      },
                      serverVersion
                  ),
              })

        data = result.data

        if (relationshipTypeID) {
            const relationshipResult = await loadTrackedEntityRelationships({
                config: loadConfig,
                engine,
                serverVersion,
                instances: result.instances,
                orgUnits: result.orgUnits,
            })

            ;({ data, relationships, secondaryData } = relationshipResult)
            legend.items.push(
                ...getRelationshipLegendItems({
                    ...config,
                    ...relationshipResult,
                })
            )
        }

        if (result.isTruncated) {
            alerts.push({
                warning: true,
                code: CUSTOM_ALERT,
                message: `${name}: ${i18n.t(
                    'Displaying first {{pageSize}} tracked entities',
                    {
                        pageSize: formatWithSeparator(
                            result.limit,
                            keyAnalysisDigitGroupSeparator
                        ),
                    }
                )}`,
            })
        }
    } catch (error) {
        loadError = error.message || i18n.t('an error occurred')
        alerts.push({
            code: ERROR_CRITICAL,
            message: loadError,
        })
    }

    // Result alert
    // -----

    if (!loadError && !data.length) {
        alerts.push({
            code: WARNING_NO_DATA,
            message: trackedEntityType.name,
        })
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
        loadError,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
    }
}

export default trackedEntityLoader
