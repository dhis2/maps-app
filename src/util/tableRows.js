import { GEOJSON_URL_LAYER } from '../constants/layers.js'

export const ERROR_NO_VALID_DATA = 'NO_VALID_DATA'

export const buildTableData = (
    layerType,
    {
        data,
        dataWithoutCoords,
        serverCluster,
        aggregations,
        isMultiPeriodThematic,
        isTimelineThematic,
        valuesByPeriod,
        externalPeriod,
        periods,
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

    if (layerType === GEOJSON_URL_LAYER) {
        return {
            data: allData.map((d, index) => ({
                ...d.properties,
                // Row-order tie-breaker for compareRows when no sortField is set
                index,
            })),
        }
    }

    const rows = allData
        .filter((d) => !d.properties.hasAdditionalGeometry)
        .map((d, index) => {
            const properties = d.properties || d

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
            const periodValues = {}
            ;(periods ?? []).forEach((period) => {
                periodValues[`period_${period.id}_rawValue`] =
                    valuesByPeriod?.[period.id]?.[orgUnitId]?.value ?? null
            })

            return {
                ...properties,
                ...(currentPeriodItem && {
                    rawValue: currentPeriodItem.rawValue,
                    color: currentPeriodItem.color,
                    legend: currentPeriodItem.legend,
                    range: currentPeriodItem.range,
                }),
                ...periodValues,
                ...aggregations[d.id],
                index,
            }
        })

    return { data: rows }
}
