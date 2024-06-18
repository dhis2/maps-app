import i18n from '@dhis2/d2-i18n'
import FileSaver from 'file-saver'
import { EVENT_LAYER } from '../constants/layers.js'
import { hasClasses } from './earthEngine.js'
import { getAnalyticsRequest, getEventColumns, loadData } from './event.js'

export const getFormatOptions = () => [
    {
        id: 'id',
        name: i18n.t('ID'),
    },
    {
        id: 'code',
        name: i18n.t('Code'),
    },
    {
        id: 'name',
        name: i18n.t('Name'),
    },
]

// Add readable prop names before downloading EE data
// Classed data (landcover) will use the class names
// Other layers will include layer name after aggregation type
export const addPropNames = (layer, data) => {
    const { aggregationType, name, legend } = layer
    const layerName = name.replace(/ /g, '_').toLowerCase()
    const { items } = legend

    return hasClasses(aggregationType)
        ? items.reduce(
              (obj, { id, name }) => ({
                  ...obj,
                  [name]: data[id],
              }),
              {}
          )
        : Object.keys(data).reduce(
              (obj, id) => ({
                  ...obj,
                  [`${id}_${layerName}`]: data[id],
              }),
              {}
          )
}

// Replaces anything that's not a letter, number or space
// Multiple spaces is replaced by a single space in the last replace
export const standardizeFilename = (name, ext) =>
    `${name.replace(/[^a-z0-9 ]/gi, '').replace(/  +/g, ' ')}.${ext}`

export const createGeoJsonBlob = (data) => {
    const geojson = {
        type: 'FeatureCollection',
        features: data,
    }

    const blob = new Blob([JSON.stringify(geojson)], {
        type: 'application/json;charset=utf-8',
    })
    return blob
}

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

export const downloadData = async ({
    layer,
    aggregations,
    format,
    humanReadableKeys,
    d2,
    nameProperty,
    engine,
}) => {
    const { name, layer: layerType } = layer
    let layerData = layer.data

    if (layerType === EVENT_LAYER) {
        const columns = await getEventColumns(layer, {
            format,
            nameProperty,
            engine,
        })
        const config = {
            ...layer,
            columns,
            outputIdScheme: humanReadableKeys ? 'NAME' : 'ID',
            columnNames: columns.reduce((res, col) => {
                res[col.dimension] = col.name
                return res
            }, {}),
        }

        const result = await loadData(
            await getAnalyticsRequest(config, { d2, nameProperty }),
            config,
            d2
        )
        layerData = result.data
    } else if (layer.valuesByPeriod) {
        layerData = includeValuesByPeriod(layer)
    }

    const data = aggregations
        ? layerData.map((d) => ({
              ...d,
              properties: {
                  ...d.properties,
                  ...addPropNames(layer, aggregations[d.id]),
              },
          }))
        : layerData

    FileSaver.saveAs(
        createGeoJsonBlob(data),
        standardizeFilename(name, 'geojson')
    )

    return true
}
