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
import { hasClasses } from '../../util/earthEngine.js'
import { filterData } from '../../util/filter.js'
import { getGeojsonDisplayData } from '../../util/geojson.js'
import { parseRange } from '../../util/legend.js'
import {
    getRoundToPrecisionFn,
    getPrecision,
    parseWithSeparator,
} from '../../util/numbers.js'
import { isValidUid } from '../../util/uid.js'

const ASCENDING = 'asc'

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const INDEX = 'index'
const NAME = 'name'
const ID = 'id'
const VALUE = 'rawValue'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = 'level'
const PARENT_NAME = 'parentName'
const TYPE = 'type'
const COLOR = 'color'
const OUNAME = 'ouname'
const EVENTDATE = 'eventdate'

const ERROR_SERVER_CLUSTER = 'SERVER_CLUSTER'
const ERROR_NO_VALID_DATA = 'NO_VALID_DATA'
const ERROR_NO_HEADERS = 'NO_HEADERS'
const ERROR_NON_HOMOGENOUS_FEATURES = 'NON_HOMOGENOUS_FEATURES'

const getErrorCodeText = (code) => {
    switch (code) {
        case ERROR_SERVER_CLUSTER:
            return i18n.t(
                'Data table is not supported when events are grouped on the server.'
            )
        case ERROR_NO_VALID_DATA:
            return i18n.t(
                'No valid data was found for the current layer configuration.'
            )
        case ERROR_NON_HOMOGENOUS_FEATURES:
            return i18n.t(
                'Data table is not supported when there is more than one geometry type in the dataset.'
            )
        case ERROR_NO_HEADERS:
            return i18n.t('No valid data fields were found for this layer.')
        default:
            return null
    }
}

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
    str.replaceAll(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    )

const getEarthEngineHeaders = ({ aggregationType, legend, data }) => {
    const { title, items } = legend

    let customFields = []

    if (hasClasses(aggregationType) && items) {
        customFields = items.map(({ value, name }) => ({
            name,
            dataKey: String(value),
            roundFn: getRoundToPrecisionFn(2),
            type: TYPE_NUMBER,
        }))
    } else if (Array.isArray(aggregationType) && aggregationType.length) {
        customFields = aggregationType.map((type) => {
            let roundFn = null
            if (data?.length) {
                const precision = getPrecision(data.map((d) => d[type]))
                roundFn = getRoundToPrecisionFn(precision)
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
        serverCluster,
    } = layer || EMPTY_LAYER

    const { data: dataWithAggregations, error: dataError } = useMemo(() => {
        if (serverCluster) {
            return { data: null, error: ERROR_SERVER_CLUSTER }
        }

        if (!data?.length) {
            return { data: null, error: ERROR_NO_VALID_DATA }
        }

        if (layerType === GEOJSON_URL_LAYER) {
            return {
                data: data.map((d) => ({ ...d.properties })),
                error: null,
            }
        }

        return {
            data: data
                .filter((d) => !d.properties.hasAdditionalGeometry)
                .map((d, index) => ({
                    ...(d.properties || d),
                    ...aggregations[d.id],
                    index,
                })),
            error: null,
        }
    }, [data, aggregations, serverCluster, layerType])

    const { headers, error: headersError } = useMemo(() => {
        if (dataError) {
            return { headers: null, error: dataError }
        }

        let computedHeaders = null
        switch (layerType) {
            case THEMATIC_LAYER:
                computedHeaders = getThematicHeaders()
                break
            case EVENT_LAYER:
                computedHeaders = getEventHeaders({
                    layerHeaders,
                    styleDataItem,
                })
                break
            case ORG_UNIT_LAYER:
                computedHeaders = getOrgUnitHeaders()
                break
            case EARTH_ENGINE_LAYER:
                computedHeaders = getEarthEngineHeaders({
                    aggregationType,
                    legend,
                    data: dataWithAggregations,
                })
                break
            case FACILITY_LAYER:
                computedHeaders = getFacilityHeaders()
                break
            case GEOJSON_URL_LAYER: {
                if (
                    data.some(
                        (feature) =>
                            feature.geometry.type !== data[0].geometry.type
                    )
                ) {
                    return {
                        headers: null,
                        error: ERROR_NON_HOMOGENOUS_FEATURES,
                    }
                }

                computedHeaders = getGeojsonDisplayData(data[0])
                break
            }
            default:
                break
        }

        if (!computedHeaders?.length) {
            return { headers: null, error: ERROR_NO_HEADERS }
        }
        return { headers: computedHeaders, error: null }
    }, [
        layerType,
        aggregationType,
        legend,
        styleDataItem,
        dataWithAggregations,
        data,
        layerHeaders,
        dataError,
    ])

    const rows = useMemo(() => {
        if (headersError) {
            return null
        }

        const filteredData = filterData(dataWithAggregations, dataFilters)

        //sort
        filteredData.sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]

            // All undefined values should be sorted to the end
            if (aVal === undefined && bVal === undefined) {
                return 0
            }

            if (aVal === undefined) {
                return 1 // aVal goes to end
            }

            if (bVal === undefined) {
                return -1 // bVal goes to end
            }

            if (typeof aVal === TYPE_NUMBER) {
                return sortDirection === ASCENDING ? aVal - bVal : bVal - aVal
            }

            if (sortField === RANGE) {
                const [aStart, aEnd] = parseRange(aVal)
                const [bStart, bEnd] = parseRange(bVal)
                const startDiff =
                    sortDirection === ASCENDING
                        ? aStart - bStart
                        : bStart - aStart
                if (startDiff !== 0) {
                    return startDiff
                }
                return sortDirection === ASCENDING ? aEnd - bEnd : bEnd - aEnd
            }

            // TODO: Make sure sorting works across different locales
            return sortDirection === ASCENDING
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal)
        })

        return filteredData.map((item) =>
            headers.map(({ dataKey, roundFn, type }) => {
                const raw = roundFn ? roundFn(item[dataKey]) : item[dataKey]
                let value
                if (type === TYPE_NUMBER) {
                    const parsed = parseWithSeparator(raw)
                    value = parsed ?? null
                } else {
                    value = raw
                }

                return {
                    dataKey,
                    value,
                    align: type === TYPE_NUMBER ? 'right' : 'left',
                    itemId: item.id,
                }
            })
        )
    }, [
        headers,
        dataWithAggregations,
        dataFilters,
        sortField,
        sortDirection,
        headersError,
    ])

    // EE layers and event layers may be loading additional data
    const isLoading =
        (layerType === EARTH_ENGINE_LAYER &&
            aggregationType?.length &&
            aggregations === EMPTY_AGGREGATIONS) ||
        (layerType === EVENT_LAYER && !layer.isExtended && !serverCluster)

    return {
        headers,
        rows,
        isLoading,
        error: getErrorCodeText(headersError),
    }
}
