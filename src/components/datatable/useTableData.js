import i18n from '@dhis2/d2-i18n'
import { isValidUid } from 'd2/uid' // TODO replace
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
} from '../../constants/layers.js'
import { numberValueTypes } from '../../constants/valueTypes.js'
import { hasClasses, getPrecision } from '../../util/earthEngine.js'
import { filterData } from '../../util/filter.js'
import { numberPrecision } from '../../util/numbers.js'

const ASCENDING = 'asc'

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const defaultFieldsMap = () => ({
    index: { name: i18n.t('Index'), dataKey: 'index' },
    name: { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
    id: { name: i18n.t('Id'), dataKey: 'id', type: TYPE_STRING },
    level: { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
    parentName: {
        name: i18n.t('Parent'),
        dataKey: 'parentName',
        type: TYPE_STRING,
    },
    type: { name: i18n.t('Type'), dataKey: 'type', type: TYPE_STRING },
    value: { name: i18n.t('Value'), dataKey: 'value', type: TYPE_NUMBER },
    legend: { name: i18n.t('Legend'), dataKey: 'legend', type: TYPE_STRING },
    range: { name: i18n.t('Range'), dataKey: 'range', type: TYPE_STRING },
    ouname: { name: i18n.t('Org unit'), dataKey: 'ouname', type: TYPE_STRING },
    eventdate: {
        name: i18n.t('Event time'),
        dataKey: 'eventdate',
        type: TYPE_DATE,
        renderer: 'formatTime...',
    },
    color: {
        name: i18n.t('Color'),
        dataKey: 'color',
        type: TYPE_STRING,
        renderer: 'rendercolor',
    },
})

const getThematicHeaders = () =>
    [
        'index',
        'name',
        'id',
        'value',
        'legend',
        'range',
        'level',
        'parentName',
        'type',
        'color',
    ].map((field) => defaultFieldsMap()[field])

const getEventHeaders = ({ layerHeaders = [], styleDataItem }) => {
    const fields = ['index', 'ouname', 'id', 'eventdate'].map(
        (field) => defaultFieldsMap()[field]
    )

    const customFields = layerHeaders
        .filter(({ name }) => isValidUid(name))
        .map(({ name: dataKey, column: name, valueType }) => ({
            name,
            dataKey,
            type: numberValueTypes.includes(valueType)
                ? TYPE_NUMBER
                : TYPE_STRING,
        }))

    customFields.push([defaultFieldsMap().type])

    if (styleDataItem) {
        customFields.push(defaultFieldsMap().color)
    }

    return fields.concat(customFields)
}

const getOrgUnitHeaders = () =>
    ['index', 'name', 'id', 'level', 'parentName', 'type'].map(
        (field) => defaultFieldsMap()[field]
    )

const getFacilityHeaders = () =>
    ['index', 'name', 'id', 'type'].map((field) => defaultFieldsMap()[field])

const toTitleCase = (str) =>
    str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )

const getEarthEngineHeaders = ({ aggregationType, legend, data }) => {
    const { title, items } = legend

    let customFields = []

    if (hasClasses(aggregationType) && items) {
        customFields = items.map(({ id, name }) => ({
            name,
            dataKey: String(id),
            roundFn: numberPrecision(2),
            type: TYPE_NUMBER,
        }))
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        customFields = aggregationType.map((type) => {
            let roundFn = null
            if (data?.length) {
                const precision = getPrecision(data.map((d) => d[type]))
                roundFn = numberPrecision(precision)
            }
            return {
                name: toTitleCase(`${type} ${title}`),
                dataKey: type,
                roundFn,
                type: TYPE_NUMBER,
            }
        })
    }

    return ['index', 'name', 'id', 'type']
        .map((field) => defaultFieldsMap()[field])
        .concat(customFields)
}

const EMPTY_AGGREGATIONS = {}
const EMPTY_LAYER = {}

export const useTableData = ({ layer, sortField, sortDirection }) => {
    const allAggregations = useSelector((state) => state.aggregations)
    const aggregations = allAggregations[layer.id] || EMPTY_AGGREGATIONS

    const {
        layer: layerType,
        aggregationType,
        legend,
        styleDataItem,
        data,
        dataFilters,
        headers: layerHeaders,
    } = layer || EMPTY_LAYER

    const indexedData = useMemo(() => {
        return data
            .map((d, i) => ({
                index: i,
                ...d,
            }))
            .filter((d) => !d.properties.hasAdditionalGeometry)
            .map((d, i) => ({
                ...(d.properties || d),
                ...aggregations[d.id],
                index: d.index,
                i,
            }))
    }, [data, aggregations])

    const headers = useMemo(() => {
        if (!layerType) {
            return []
        }

        switch (layerType) {
            case THEMATIC_LAYER:
                return getThematicHeaders()
            case EVENT_LAYER:
                return getEventHeaders({ layerHeaders, styleDataItem })
            case ORG_UNIT_LAYER:
                return getOrgUnitHeaders()
            case EARTH_ENGINE_LAYER:
                return getEarthEngineHeaders({
                    aggregationType,
                    legend,
                    data: indexedData,
                })
            case FACILITY_LAYER:
                return getFacilityHeaders()
            default:
                // TODO - throw error?
                return []
        }
    }, [
        layerType,
        aggregationType,
        legend,
        styleDataItem,
        indexedData,
        layerHeaders,
    ])

    const rows = useMemo(() => {
        if (!indexedData.length && !headers?.length) {
            return []
        }

        const filteredData = filterData(indexedData, dataFilters)

        //sort
        filteredData.sort((a, b) => {
            a = a[sortField]
            b = b[sortField]

            if (typeof a === TYPE_NUMBER) {
                return sortDirection === ASCENDING ? a - b : b - a
            }
            // TODO: Make sure sorting works across different locales - use lib method
            if (a !== undefined) {
                return sortDirection === ASCENDING
                    ? a.localeCompare(b)
                    : b.localeCompare(a)
            }

            return 0
        })

        return filteredData.map((item) =>
            headers.map(({ dataKey, roundFn }) => ({
                value: roundFn ? roundFn(item[dataKey]) : item[dataKey],
                dataKey,
            }))
        )
    }, [indexedData, dataFilters, sortField, sortDirection, headers])

    return { headers, rows }
}
