import { EVENT_LAYER } from '../../../constants/layers.js'
import { loadData as loadEventData } from '../../../loaders/eventLoader.js'
import { addPropNames } from '../../../util/earthEngine.js'
import { downloadGeoJson } from '../../../util/geojson.js'
import { getAnalyticsRequest } from '../../../util/getAnalyticsRequest.js'
import { getEventColumns } from '../../../util/requests.js'

// Includes values for each period in feature properties
const includeValuesByPeriod = ({ data, valuesByPeriod }) => {
    const periods = Object.keys(valuesByPeriod)

    return data.map((feature) => ({
        ...feature,
        properties: {
            ...feature.properties,
            ...periods.reduce((values, periodId) => {
                const periodValue = valuesByPeriod[periodId][feature.id]

                values[`period_${periodId}`] = periodValue
                    ? Number(periodValue.value)
                    : null

                return values
            }, {}),
        },
    }))
}
const loadData = async ({ layer, format, humanReadableKeys, d2 }) => {
    const layerType = layer.layer
    if (layerType === EVENT_LAYER) {
        const columns = await getEventColumns(layer, { format, d2 })
        const config = {
            ...layer,
            columns,
            outputIdScheme: humanReadableKeys ? 'NAME' : 'ID',
            columnNames: columns.reduce((res, col) => {
                res[col.dimension] = col.name
                return res
            }, {}),
        }

        console.log('config', config)
        const result = await loadEventData(
            await getAnalyticsRequest(config, d2),
            config,
            d2
        )
        return result.data
    }
    if (layer.valuesByPeriod) {
        return includeValuesByPeriod(layer)
    }

    return layer.data
}

const downloadData = async ({
    layer,
    aggregations,
    format,
    humanReadableKeys,
    d2,
}) => {
    const { name } = layer
    const layerData = await loadData({
        layer,
        format,
        humanReadableKeys,
        d2,
    })

    const data = aggregations
        ? layerData.map((d) => ({
              ...d,
              properties: {
                  ...d.properties,
                  ...addPropNames(layer, aggregations[d.id]),
              },
          }))
        : layerData

    await downloadGeoJson({ name, data })

    return true
}

export { downloadData }
