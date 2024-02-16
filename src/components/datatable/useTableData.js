import i18n from '@dhis2/d2-i18n'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
} from '../../constants/layers.js'
import { numberValueTypes } from '../../constants/valueTypes.js'
import { hasClasses, getPrecision } from '../../util/earthEngine.js'
import { filterData } from '../../util/filter.js'
import { isValidUid } from '../../util/helpers.js'
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
    [INDEX]: { name: i18n.t('Index'), dataKey: INDEX, type: TYPE_NUMBER },
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

const getGeoJsonUrlHeaders = (data) => {
    const customFields = Object.entries(data[0])
        .filter(
            ([, value]) =>
                typeof value === TYPE_NUMBER || typeof value === TYPE_STRING
        )
        .map(([key, value]) => {
            let roundFn = null
            const type =
                typeof value === TYPE_NUMBER ? TYPE_NUMBER : TYPE_STRING
            if (type === TYPE_NUMBER) {
                const precision = getPrecision(data.map((d) => d[key]))
                roundFn = numberPrecision(precision)
            }

            return {
                name: key,
                dataKey: key,
                type,
                roundFn,
            }
        })

    customFields.push(defaultFieldsMap()[TYPE])
    return customFields
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
        serverCluster,
    } = layer || EMPTY_LAYER

    const dataWithAggregations = useMemo(() => {
        if (!data || serverCluster) {
            return null
        }
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
    }, [data, aggregations, serverCluster])

    const headers = useMemo(() => {
        if (dataWithAggregations === null) {
            return null
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
            case GEOJSON_URL_LAYER:
                return getGeoJsonUrlHeaders(dataWithAggregations)
            default: {
                return null
            }
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
        if (dataWithAggregations === null || headers === null) {
            return null
        }

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
            headers.map(({ dataKey, roundFn, type }) => {
                const value = roundFn ? roundFn(item[dataKey]) : item[dataKey]

                return {
                    dataKey,
                    value: type === TYPE_NUMBER && isNaN(value) ? null : value,
                    align: type === TYPE_NUMBER ? 'right' : 'left',
                }
            })
        )
    }, [headers, dataWithAggregations, dataFilters, sortField, sortDirection])

    // EE layers and event layers may be loading additional data
    const isLoading =
        (layerType === EARTH_ENGINE_LAYER &&
            aggregationType?.length &&
            (!aggregations || aggregations === EMPTY_AGGREGATIONS)) ||
        (layerType === EVENT_LAYER && !layer.isExtended && !serverCluster)

    let error = null
    if (serverCluster) {
        error = i18n.t(
            'Data table is not supported when events are grouped on the server.'
        )
    } else if (dataWithAggregations === null) {
        error = i18n.t(
            'No valid data was found for the current layer configuration.'
        )
    } else if (headers === null) {
        error = i18n.t('Data table is not supported for this layer type.')
    }

    return { headers, rows, isLoading, error }
}
