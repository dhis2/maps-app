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
import { formatStartEndDate, getDateArray } from '../util/time.js'
import {
    createTrackedEntityInstanceFeatures,
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
    keyAnalysisDigitGroupSeparator,
    serverVersion,
}) => {
    parseJsonConfig(config)

    const {
        trackedEntityType,
        program,
        programStatus,
        relationshipType: relationshipTypeID,
        startDate,
        endDate,
        eventPointColor,
        eventPointRadius,
        areaRadius,
        relatedPointColor,
        relatedPointRadius,
        relationshipLineColor,
    } = config

    const name = program ? program.name : i18n.t('Tracked entity')

    const alerts = []
    let legend, loadError, relationships, secondaryData
    let data = []

    try {
        legend = {
            title: name,
            period: formatStartEndDate(
                getDateArray(startDate),
                getDateArray(endDate)
            ),
            items: [
                {
                    name:
                        trackedEntityType.name +
                        (areaRadius
                            ? ` + ${areaRadius} ${'m'} ${'buffer'}`
                            : ''),
                    color: eventPointColor || TEI_COLOR,
                    radius: eventPointRadius || TEI_RADIUS,
                },
            ],
        }

        if (program && programStatus) {
            legend.explanation = [
                `${i18n.t('Program status')}: ${
                    getProgramStatuses().find((s) => s.id === programStatus)
                        ?.name ?? programStatus
                }`,
            ]
        }

        const { instances, orgUnits } = await loadTrackedEntitiesFromTracker({
            config,
            engine,
            serverVersion,
        })

        if (!instances.length) {
            alerts.push({
                code: WARNING_NO_DATA,
                message: trackedEntityType.name,
            })
        }

        data = createTrackedEntityInstanceFeatures(instances)

        if (relationshipTypeID) {
            // The tracked entities are still shown when this fails
            const relationshipResult = await loadTrackedEntityRelationships({
                config,
                engine,
                serverVersion,
                instances,
                orgUnits,
            }).catch(() => {
                alerts.push({
                    warning: true,
                    code: CUSTOM_ALERT,
                    message: `${name}: ${i18n.t(
                        'Relationships could not be loaded'
                    )}`,
                })
                return null
            })

            // Only relationships between tracked entities are drawn
            if (relationshipResult?.relatedEntityType) {
                legend.items.push(
                    ...getRelationshipLegendItems({
                        relationshipType: relationshipResult.relationshipType,
                        relatedEntityType: relationshipResult.relatedEntityType,
                        relatedPointColor,
                        relatedPointRadius,
                        relationshipLineColor,
                    })
                )
            }

            if (relationshipResult) {
                ;({ data, relationships, secondaryData } = relationshipResult)
            }
        }
    } catch (error) {
        loadError = error.message || error
        alerts.push({
            code: ERROR_CRITICAL,
            message: loadError,
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
        // Always set, as the config can have the previous load's alerts and error
        alerts: alerts.length ? alerts : undefined,
        loadError,
        isLoaded: true,
        isLoading: false,
        isExpanded: true,
    }
}

export default trackedEntityLoader
