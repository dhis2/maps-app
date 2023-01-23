import i18n from '@dhis2/d2-i18n'
import FileSaver from 'file-saver' // https://github.com/eligrey/FileSaver.js
import { addPropNames } from './earthEngine.js'

/*
export const META_DATA_FORMAT_ID = 'ID'
export const META_DATA_FORMAT_NAME = 'Name'
export const META_DATA_FORMAT_CODE = 'Code'
*/

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

// const DEFAULT_FORMAT = FORMAT_OPTIONS[2]

const standardizeFilename = (rawName) => rawName.replace(/\s+/g, '_')
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

export const downloadGeoJson = ({ name, data }) =>
    FileSaver.saveAs(
        createGeoJsonBlob(data),
        standardizeFilename(name) + '.geojson'
    )

export const addAggregatedValues = (layer, data, aggregations) =>
    data.map((d) => ({
        ...d,
        properties: {
            ...d.properties,
            ...addPropNames(layer, aggregations[d.id]),
        },
    }))

/*    
const loadData = async (layer, format, humanReadableKeys) => {
    const layerType = layer.layer
    if (layerType === EVENT_LAYER) {
        const columns = await getEventColumns(layer, format)
        const config = {
            ...layer,
            columns,
            outputIdScheme: humanReadableKeys ? 'NAME' : 'ID',
            columnNames: columns.reduce((res, col) => {
                res[col.dimension] = col.name
                return res
            }, {}),
        }
        const result = await loadEventData(
            await getAnalyticsRequest(config),
            config
        )
        return result.data
    }
    if (layer.valuesByPeriod) {
        return includeValuesByPeriod(layer)
    }

    return layer.data
}
*/
