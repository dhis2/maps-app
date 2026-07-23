import { GEOJSON_URL_LAYER } from '../constants/layers.js'
import { isFeatureInBounds } from './geojson.js'
import { formatRangeWithSeparator } from './numbers.js'

export const ERROR_NO_VALID_DATA = 'NO_VALID_DATA'

export const buildTableData = (
    layerType,
    {
        data,
        dataWithoutCoords,
        serverCluster,
        showOnlyFeaturesInView,
        mapBounds,
        aggregations,
        isStyledEvent,
        isMultiPeriodThematic,
        isTimelineThematic,
        legend,
        valuesByPeriod,
        externalPeriod,
        periods,
        keyAnalysisDigitGroupSeparator,
        legendDecimalPlaces,
    }
) => {
    if (serverCluster) {
        return { data: [] }
    }

    const allData = dataWithoutCoords?.length
        ? [...(data || []), ...dataWithoutCoords]
        : data

    if (!allData?.length) {
        return { errorCode: ERROR_NO_VALID_DATA }
    }

    const inViewData = showOnlyFeaturesInView
        ? allData.filter((d) => isFeatureInBounds(d, mapBounds))
        : allData

    if (layerType === GEOJSON_URL_LAYER) {
        return {
            data: inViewData.map((d, index) => ({
                ...d.properties,
                // Row-order tie-breaker for compareRows when no sortField is set
                index,
            })),
        }
    }

    const rows = inViewData
        .filter((d) => !d.properties.hasAdditionalGeometry)
        .map((d, index) => {
            const properties = d.properties || d

            if (isStyledEvent) {
                const legendItem = legend?.items?.[properties.colorGroup]
                return {
                    ...properties,
                    legend: legendItem?.name,
                    range:
                        legendItem && 'startValue' in legendItem
                            ? formatRangeWithSeparator(
                                  legendItem,
                                  keyAnalysisDigitGroupSeparator,
                                  { precision: legendDecimalPlaces }
                              )
                            : undefined,
                    ...aggregations[d.id],
                    index,
                }
            }

            if (!isMultiPeriodThematic) {
                return {
                    ...properties,
                    ...aggregations[d.id],
                    // Row-order tie-breaker for compareRows when no sortField is set
                    index,
                }
            }

            const orgUnitId = properties.id
            const currentPeriodItem = isTimelineThematic
                ? valuesByPeriod?.[externalPeriod?.id]?.[orgUnitId]
                : null
            const otherPeriodValues = {}
            ;(periods ?? []).forEach((period) => {
                if (isTimelineThematic && period.id === externalPeriod?.id) {
                    return
                }
                otherPeriodValues[`period_${period.id}_rawValue`] =
                    valuesByPeriod?.[period.id]?.[orgUnitId]?.value ?? null
            })

            return {
                ...properties,
                ...(currentPeriodItem && {
                    rawValue: currentPeriodItem.value,
                    color: currentPeriodItem.color,
                    legend: currentPeriodItem.legend,
                    range: currentPeriodItem.range,
                }),
                ...otherPeriodValues,
                ...aggregations[d.id],
                index,
            }
        })

    return { data: rows }
}
