import i18n from '@dhis2/d2-i18n'
import { useMemo, useRef } from 'react'
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
import { getRoundToPrecisionFn, getPrecision } from '../../util/numbers.js'
import { isValidUid } from '../../util/uid.js'

const ASCENDING = 'asc'

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const INDEX = 'index'
const NAME = 'name'
const ID = 'id'
const CODE = 'code'
const VALUE = 'rawValue'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = 'level'
const PARENT_NAME = 'parentName'
const TYPE = 'type'
const COLOR = 'color'
const OUNAME = 'ouname'
const OUBOUNDARY = 'ouBoundary'
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
    [ID]: { name: i18n.t('ID'), dataKey: ID, type: TYPE_STRING, mono: true },
    [CODE]: {
        name: i18n.t('Code'),
        dataKey: CODE,
        type: TYPE_STRING,
        mono: true,
    },
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
    [OUBOUNDARY]: {
        name: i18n.t('Org unit boundary'),
        dataKey: OUBOUNDARY,
        type: TYPE_STRING,
    },
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

// Standard default columns. Every layer type follows the same order:
// identity (name) -> the layer's data -> org unit context -> technical IDs.
// Index, geometry type and raw color are available but hidden by default
// (color is shown as a swatch in the Legend column instead).
const withHidden = (visible, hidden) =>
    visible
        .map((field) => ({ ...defaultFieldsMap()[field], hidden: false }))
        .concat(
            hidden.map((field) => ({
                ...defaultFieldsMap()[field],
                hidden: true,
            }))
        )

const getThematicHeaders = () =>
    withHidden(
        [NAME, VALUE, LEGEND, RANGE, PARENT_NAME, LEVEL, ID],
        [CODE, TYPE, COLOR, INDEX]
    )

const getEventHeaders = ({
    layerHeaders = [],
    styleDataItem,
    countEventsOutsideOrgUnits,
}) => {
    const fields = withHidden([OUNAME, EVENTDATE], [])

    if (countEventsOutsideOrgUnits) {
        fields.push({ ...defaultFieldsMap()[OUBOUNDARY], hidden: false })
    }

    const customFields = layerHeaders
        .filter(({ name }) => isValidUid(name))
        .map(({ name: dataKey, column: name, valueType, optionSet }) => ({
            name,
            dataKey,
            type:
                !optionSet && numberValueTypes.includes(valueType)
                    ? TYPE_NUMBER
                    : TYPE_STRING,
        }))

    return fields
        .concat(customFields.map((field) => ({ ...field, hidden: false })))
        .concat(
            withHidden(
                [ID],
                styleDataItem ? [TYPE, COLOR, INDEX] : [TYPE, INDEX]
            )
        )
}

const getOrgUnitHeaders = () =>
    withHidden([NAME, PARENT_NAME, LEVEL, ID], [CODE, TYPE, INDEX])

const getFacilityHeaders = () =>
    withHidden([NAME, PARENT_NAME, ID], [CODE, TYPE, INDEX])

const toTitleCase = (str) =>
    str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
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

    return withHidden([NAME], [])
        .concat(customFields.map((field) => ({ ...field, hidden: false })))
        .concat(withHidden([ID], [TYPE, INDEX]))
}

const getGeoJsonUrlHeaders = (firstDataItem) =>
    getGeojsonDisplayData(firstDataItem)

// PROTOTYPE ONLY: org unit codes are not loaded with the layer data, so a
// stable placeholder is derived from the id to demo the Code column.
const getPrototypeCode = (id) => {
    if (!id) {
        return undefined
    }
    const hash = [...id].reduce(
        (acc, c) => (acc * 31 + c.charCodeAt(0)) % 99991,
        7
    )
    return `OU_${hash}`
}

const EMPTY_AGGREGATIONS = {}
const EMPTY_LAYER = {}

export const useTableData = ({
    layer,
    sortField,
    sortDirection,
    visibleColumns,
}) => {
    const allAggregations = useSelector((state) => state.aggregations)
    const aggregations = allAggregations[layer.id] || EMPTY_AGGREGATIONS

    const errorCode = useRef(null)

    const {
        layer: layerType,
        aggregationType,
        legend,
        styleDataItem,
        countEventsOutsideOrgUnits,
        data,
        dataWithoutCoords,
        dataFilters,
        headers: layerHeaders,
        serverCluster,
    } = layer || EMPTY_LAYER

    const dataWithAggregations = useMemo(() => {
        errorCode.current = null
        if (serverCluster) {
            errorCode.current = ERROR_SERVER_CLUSTER
            return null
        }

        const allData = dataWithoutCoords?.length
            ? [...(data || []), ...dataWithoutCoords]
            : data

        if (!allData?.length) {
            errorCode.current = ERROR_NO_VALID_DATA
            return null
        }

        if (layerType === GEOJSON_URL_LAYER) {
            return allData.map((d) => ({
                ...d.properties,
            }))
        }

        return allData
            .filter((d) => !d.properties.hasAdditionalGeometry)
            .map((d, index) => ({
                ...(d.properties || d),
                ...aggregations[d.id],
                code: d.properties?.code ?? getPrototypeCode(d.properties?.id),
                index,
            }))
    }, [data, dataWithoutCoords, aggregations, serverCluster, layerType])

    const headers = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        let headers = null
        switch (layerType) {
            case THEMATIC_LAYER:
                headers = getThematicHeaders()
                break
            case EVENT_LAYER:
                headers = getEventHeaders({
                    layerHeaders,
                    styleDataItem,
                    countEventsOutsideOrgUnits,
                })
                break
            case ORG_UNIT_LAYER:
                headers = getOrgUnitHeaders()
                break
            case EARTH_ENGINE_LAYER:
                headers = getEarthEngineHeaders({
                    aggregationType,
                    legend,
                    data: dataWithAggregations,
                })
                break
            case FACILITY_LAYER:
                headers = getFacilityHeaders()
                break
            case GEOJSON_URL_LAYER: {
                if (
                    data.some(
                        (feature) =>
                            feature.geometry.type !== data[0].geometry.type
                    )
                ) {
                    errorCode.current = ERROR_NON_HOMOGENOUS_FEATURES
                    return null
                }

                headers = getGeoJsonUrlHeaders(data[0])
                break
            }
            default:
                break
        }

        if (!headers?.length) {
            errorCode.current = ERROR_NO_HEADERS
            return null
        }
        return headers
    }, [
        layerType,
        aggregationType,
        legend,
        styleDataItem,
        countEventsOutsideOrgUnits,
        dataWithAggregations,
        data,
        layerHeaders,
    ])

    // visibleColumns (ordered dataKeys) overrides the layer type defaults
    const visibleHeaders = useMemo(() => {
        if (!headers) {
            return headers
        }
        if (!visibleColumns) {
            return headers.filter((h) => !h.hidden)
        }
        return visibleColumns
            .map((key) => headers.find((h) => h.dataKey === key))
            .filter(Boolean)
    }, [headers, visibleColumns])

    const rows = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        if (!visibleHeaders.length) {
            errorCode.current = ERROR_NO_HEADERS
            return null
        }

        // Copy so the default (unsorted) order is never mutated
        const filteredData = [...filterData(dataWithAggregations, dataFilters)]

        // No sort field means the default order
        sortField &&
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
                    return sortDirection === ASCENDING
                        ? aVal - bVal
                        : bVal - aVal
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
                    return sortDirection === ASCENDING
                        ? aEnd - bEnd
                        : bEnd - aEnd
                }

                // TODO: Make sure sorting works across different locales
                return sortDirection === ASCENDING
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal)
            })

        return filteredData.map((item) =>
            visibleHeaders.map(({ dataKey, roundFn, type, mono }) => {
                const value = roundFn ? roundFn(item[dataKey]) : item[dataKey]

                return {
                    dataKey,
                    value: type === TYPE_NUMBER && isNaN(value) ? null : value,
                    align: type === TYPE_NUMBER ? 'right' : 'left',
                    mono,
                    swatch: dataKey === LEGEND ? item.color : undefined,
                    itemId: item.id,
                }
            })
        )
    }, [
        visibleHeaders,
        dataWithAggregations,
        dataFilters,
        sortField,
        sortDirection,
    ])

    // EE layers and event layers may be loading additional data
    const isLoading =
        (layerType === EARTH_ENGINE_LAYER &&
            aggregationType?.length &&
            (!aggregations || aggregations === EMPTY_AGGREGATIONS)) ||
        (layerType === EVENT_LAYER && !layer.isExtended && !serverCluster)

    return {
        headers: visibleHeaders,
        allHeaders: headers,
        rows,
        isLoading,
        error: getErrorCodeText(errorCode.current),
    }
}
