import i18n from '@dhis2/d2-i18n'
import { isValidUid } from 'd2/uid' // TODO replace
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    GEOJSON_URL_LAYER,
    EXTERNAL_LAYER,
    FACILITY_LAYER,
    EARTH_ENGINE_LAYER,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import { hasClasses } from './earthEngine.js'

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const getIndexHeader = () => ({
    name: i18n.t('Index'),
    dataKey: 'index',
    // type: TYPE_STRING,
})

const getIdHeader = () => ({
    name: i18n.t('Id'),
    dataKey: 'id',
    type: TYPE_STRING,
})

const getNameHeader = (isOu = false) => ({
    name: isOu ? i18n.t('Org unit') : i18n.t('Name'),
    dataKey: isOu ? 'ouname' : 'name',
    type: TYPE_STRING,
})

const getTypeHeader = () => ({
    name: i18n.t('Type'),
    dataKey: 'type',
    type: TYPE_STRING,
})

const getThematicHeaders = () => [
    getIndexHeader(),
    getNameHeader(),
    getIdHeader(),
    { name: i18n.t('Value'), dataKey: 'value', type: TYPE_NUMBER },
    { name: i18n.t('Legend'), dataKey: 'legend', type: TYPE_STRING },
    { name: i18n.t('Range'), dataKey: 'range', type: TYPE_STRING },
    { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
    { name: i18n.t('Parent'), dataKey: 'parentName', type: TYPE_STRING },
    getTypeHeader(),
]

const getEventHeaders = (layer) => {
    const defaultFieldsStart = [
        getIndexHeader(),
        getNameHeader(true),
        getIdHeader(),
        {
            name: i18n.t('Event time'),
            dataKey: 'eventdate',
            type: TYPE_DATE,
        },
    ]

    const { headers = [] } = layer

    const customFields = headers
        .filter(({ name }) => isValidUid(name))
        .map(({ name, column, valueType }) => ({
            name: column,
            dataKey: name,
            type: numberValueTypes.includes(valueType)
                ? TYPE_NUMBER
                : TYPE_STRING,
        }))

    return defaultFieldsStart.concat(customFields).concat([getTypeHeader()])
}

const getOrgUnitHeaders = () => [
    getIndexHeader(),
    getNameHeader(),
    getIdHeader(),
    { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
    { name: i18n.t('Parent'), dataKey: 'parentName', type: TYPE_STRING },
    getTypeHeader(),
]

const getFacilityHeaders = () => [
    getIndexHeader(),
    getNameHeader(),
    getIdHeader(),
    getTypeHeader(),
]

const getGeoJsonUrlHeaders = (layer) => {
    const row = layer.data[0]
    const headers = Object.entries(row.properties).map(([key, value]) => ({
        name: key,
        dataKey: key,
        type: typeof value === 'number' ? TYPE_NUMBER : TYPE_STRING,
    }))
    return headers
}

const getEarthEngineHeaders = ({ aggregationType, legend }) => {
    const { title, items } = legend

    let eeheaders = []

    if (hasClasses(aggregationType) && items) {
        eeheaders = items.map(({ id, name }) => ({
            name,
            dataKey: String(id),
            type: TYPE_NUMBER,
        }))
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        eeheaders = aggregationType.map((type) => ({
            name: `${type} ${title}`,
            dataKey: type,
            type: TYPE_NUMBER,
        }))
    }

    return [
        getIndexHeader(),
        getNameHeader(),
        getIdHeader(),
        getTypeHeader(),
    ].concat(eeheaders)
}

export const getBasicHeaders = (layer) => {
    switch (layer.layer) {
        case THEMATIC_LAYER:
            return getThematicHeaders()
        case EVENT_LAYER:
            return getEventHeaders(layer)
        case ORG_UNIT_LAYER:
            return getOrgUnitHeaders(layer)
        case GEOJSON_URL_LAYER:
        case EXTERNAL_LAYER:
            return getGeoJsonUrlHeaders(layer)
        case FACILITY_LAYER:
            return getFacilityHeaders(layer)
        case EARTH_ENGINE_LAYER:
            return getEarthEngineHeaders(layer)
        default:
            // TODO throw error?
            break
    }
}

export const getHeaders = (layer, styleDataItem) => {
    const headers = getBasicHeaders(layer)

    if (layer.layer === THEMATIC_LAYER || styleDataItem) {
        headers.push({
            name: i18n.t('Color'),
            dataKey: 'color',
            renderer: 'rendercolor',
        })
    }

    return headers
}
