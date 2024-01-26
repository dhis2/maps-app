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

const INDEX = 'index'
const NAME = 'name'
const ID = 'id'
const VALUE = 'value'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = 'level'
const PARENT_NAME = 'parentName'
const TYPE = 'type'
const COLOR = 'color'
const OUNAME = 'ouname'
const EVENTDATE = 'eventdate'

const defaultFieldsMap = () => ({
    [INDEX]: { name: i18n.t('Index'), dataKey: INDEX },
    [NAME]: { name: i18n.t('Name'), dataKey: NAME, type: TYPE_STRING },
    [ID]: { name: i18n.t('Id'), dataKey: ID, type: TYPE_STRING },
    [LEVEL]: { name: i18n.t('Level'), dataKey: LEVEL, type: TYPE_NUMBER },
    [PARENT_NAME]: {
        name: i18n.t('Parent'),
        dataKey: PARENT_NAME,
        type: TYPE_STRING,
    },
    [TYPE]: { name: i18n.t('Type'), dataKey: TYPE, type: TYPE_STRING },
    [VALUE]: { name: i18n.t('Value'), dataKey: VALUE, type: TYPE_NUMBER },
    [LEGEND]: { name: i18n.t('Legend'), dataKey: LEGEND, type: TYPE_STRING },
    [RANGE]: { name: i18n.t('Range'), dataKey: RANGE, type: TYPE_STRING },
    [OUNAME]: { name: i18n.t('Org unit'), dataKey: OUNAME, type: TYPE_STRING },
    [EVENTDATE]: {
        name: i18n.t('Event time'),
        dataKey: EVENTDATE,
        type: TYPE_DATE,
        renderer: 'formatTime...',
    },
    [COLOR]: {
        name: i18n.t('Color'),
        dataKey: COLOR,
        type: TYPE_STRING,
        renderer: 'rendercolor',
    },
})

const getThematicHeaders = () =>
    [
        INDEX,
        NAME,
        ID,
        VALUE,
        LEGEND,
        RANGE,
        LEVEL,
        PARENT_NAME,
        TYPE,
        COLOR,
    ].map((field) => defaultFieldsMap()[field])

const getEventHeaders = ({ layerHeaders = [], styleDataItem }) => {
    const fields = [INDEX, OUNAME, ID, EVENTDATE].map(
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

    customFields.push(defaultFieldsMap()[TYPE])

    if (styleDataItem) {
        customFields.push(defaultFieldsMap()[COLOR])
    }

    return fields.concat(customFields)
}

const getOrgUnitHeaders = () =>
    [INDEX, NAME, ID, LEVEL, PARENT_NAME, TYPE].map(
        (field) => defaultFieldsMap()[field]
    )

const getFacilityHeaders = () =>
    [INDEX, NAME, ID, TYPE].map((field) => defaultFieldsMap()[field])

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

    return [INDEX, NAME, ID, TYPE]
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

    const dataWithAggregations = useMemo(
        () =>
            data
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
                })),
        [data, aggregations]
    )

    const headers = useMemo(() => {
        if (!layerType || !dataWithAggregations.length) {
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
                    data: dataWithAggregations,
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
        dataWithAggregations,
        layerHeaders,
    ])

    const rows = useMemo(() => {
        if (!dataWithAggregations.length || !headers?.length) {
            return []
        }

        const filteredData = filterData(dataWithAggregations, dataFilters)

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
    }, [dataWithAggregations, dataFilters, sortField, sortDirection, headers])

    return { headers, rows }
}
