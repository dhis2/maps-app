import i18n from '@dhis2/d2-i18n'
import { useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { SENTINEL_NO_VALUE, SORT_ASCENDING } from '../../constants/dataTable.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
    GEOJSON_URL_LAYER,
    TRACKED_ENTITY_LAYER,
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
} from '../../constants/layers.js'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../constants/selection.js'
import { numberValueTypes } from '../../constants/valueTypes.js'
import { hasClasses } from '../../util/earthEngine.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import { getGeojsonDisplayData, isFeatureInBounds } from '../../util/geojson.js'
import {
    formatRangeWithSeparator,
    getRoundToPrecisionFn,
    getPrecision,
} from '../../util/numbers.js'
import { compareColumnOptionValues, compareRows } from '../../util/tableSort.js'
import { isValidUid } from '../../util/uid.js'

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const NAME = 'name'
const ID = 'id'
const VALUE = 'rawValue'
const LEGEND = 'legend'
const RANGE = 'range'
const LEVEL = 'level'
const PARENT_NAME = 'parentName'
const TYPE = 'type'
const COLOR = 'color'
const GROUP = 'group'
const ICON = 'iconUrl'
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
    [GROUP]: { name: i18n.t('Group'), dataKey: GROUP, type: TYPE_STRING },
    [ICON]: {
        name: i18n.t('Icon'),
        dataKey: ICON,
        type: TYPE_STRING,
        renderer: 'rendericon',
    },
})

// Canonical trailing order for classification/styling columns - shared
// across every layer type that has any subset of them, so switching
// between layer types never reshuffles where these appear relative to
// each other (e.g. Group always comes before Color, Color always comes
// before Icon, regardless of which layer type is showing them).
const getStyleHeaders = ({
    hasLegend,
    hasRange,
    hasGroup,
    hasColor,
    hasIcon,
}) => {
    const headers = []
    if (hasLegend) {
        headers.push(defaultFieldsMap()[LEGEND])
    }
    if (hasRange) {
        headers.push(defaultFieldsMap()[RANGE])
    }
    if (hasGroup) {
        headers.push(defaultFieldsMap()[GROUP])
    }
    if (hasColor) {
        headers.push(defaultFieldsMap()[COLOR])
    }
    if (hasIcon) {
        headers.push(defaultFieldsMap()[ICON])
    }
    return headers
}

const getThematicHeaders = () =>
    [NAME, ID, VALUE, LEVEL, PARENT_NAME, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(
            getStyleHeaders({ hasLegend: true, hasRange: true, hasColor: true })
        )

// Timeline gets the standard Value/Legend/Range/Color columns, relabeled
// with the active period's name (updates live as the timeline slider
// moves). Split-by-period has no single "current" period to privilege, so
// it only gets the base org unit columns - same shape as getOrgUnitHeaders.
// Every other available period (all of them, for split - every one but the
// active one, for timeline, since that one's already the Value/Legend/
// Range/Color columns above) gets its own raw-value-only column too,
// hidden by default (defaultHidden) so the table isn't cluttered with
// every period until the user turns one on from the column picker.
const getMultiPeriodThematicHeaders = ({
    isTimelineThematic,
    externalPeriod,
    periods,
}) => {
    const headers = isTimelineThematic
        ? getThematicHeaders().map((header) =>
              [VALUE, LEGEND, RANGE, COLOR].includes(header.dataKey)
                  ? {
                        ...header,
                        name: `${header.name} (${
                            externalPeriod?.name ?? i18n.t('Current period')
                        })`,
                    }
                  : header
          )
        : getOrgUnitHeaders()

    const otherPeriods = isTimelineThematic
        ? (periods ?? []).filter((p) => p.id !== externalPeriod?.id)
        : periods ?? []

    otherPeriods.forEach((period) => {
        headers.push({
            name: i18n.t('Value ({{period}})', { period: period.name }),
            dataKey: `period_${period.id}_rawValue`,
            type: TYPE_NUMBER,
            defaultHidden: true,
        })
    })

    return headers
}

const getEventHeaders = ({
    layerHeaders = [],
    styleDataItem,
    countEventsOutsideOrgUnits,
}) => {
    const fields = [OUNAME, ID, EVENTDATE].map(
        (field) => defaultFieldsMap()[field]
    )

    if (countEventsOutsideOrgUnits) {
        fields.push(defaultFieldsMap()[OUBOUNDARY])
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
            optionSet: optionSet || null,
        }))

    customFields.push(defaultFieldsMap()[TYPE])
    customFields.push(
        ...getStyleHeaders({
            hasLegend: !!styleDataItem,
            hasRange: !!styleDataItem,
            hasColor: !!styleDataItem,
        })
    )

    return fields.concat(customFields)
}

// Facility/org unit layers only get Group/Color/Icon columns when the
// current group-set styling actually produced them - style type (and
// whether every org unit matched a group) isn't known up front, so this
// checks the resolved row data rather than re-deriving that logic here.
const getOrgUnitStyleHeaders = (data) =>
    getStyleHeaders({
        hasGroup: data?.some((d) => d.group != null),
        hasColor: data?.some((d) => d.color != null),
        hasIcon: data?.some((d) => d.iconUrl != null),
    })

const getOrgUnitHeaders = (data) =>
    [NAME, ID, LEVEL, PARENT_NAME, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(getOrgUnitStyleHeaders(data))

// Unlike getEventHeaders's layerHeaders (raw analytics response shape,
// name=uid/column=display), trackedEntityLoader.js already builds its
// headers in the final {name, dataKey, valueType} shape - only the
// valueType -> table type classification needs doing here.
const getTrackedEntityHeaders = ({ layerHeaders = [] }) => {
    const fields = [ID].map((field) => defaultFieldsMap()[field])

    const customFields = layerHeaders
        .filter(({ dataKey }) => isValidUid(dataKey))
        .map(({ name, dataKey, valueType }) => ({
            name,
            dataKey,
            type: numberValueTypes.includes(valueType)
                ? TYPE_NUMBER
                : TYPE_STRING,
        }))

    customFields.push(...getStyleHeaders({ hasColor: true }))

    return fields.concat(customFields)
}

const getFacilityHeaders = (data) =>
    [NAME, ID, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(getOrgUnitStyleHeaders(data))

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

    return [NAME, ID, TYPE]
        .map((field) => defaultFieldsMap()[field])
        .concat(customFields)
}

// The synthetic per-geometry-type `color` property gets the same
// canonical, translated Color header every other layer type uses,
// rather than being treated as just another arbitrary uploaded field.
const getGeoJsonUrlHeaders = (firstDataItem) =>
    getGeojsonDisplayData(firstDataItem).map((header) =>
        header.dataKey === COLOR ? defaultFieldsMap()[COLOR] : header
    )

const EMPTY_AGGREGATIONS = {}
const EMPTY_LAYER = {}
const EMPTY_COLUMN_OPTIONS = {}

export const useTableData = ({
    layer,
    sortField,
    sortDirection,
    showOnlyFeaturesInView,
    mapBounds,
    selectionFilter,
    selectedIdSet,
    globalSearch,
    keyAnalysisDigitGroupSeparator,
}) => {
    const allAggregations = useSelector((state) => state.aggregations)
    const aggregations = allAggregations[layer.id] || EMPTY_AGGREGATIONS
    // The timeline's active period is Map.jsx's own local UI state, not
    // part of the layer config stored in Redux - it's synced into
    // state.ui separately (see Map.jsx/MapContainer.jsx) so the data
    // table, a sibling of the map, can read the same "current period".
    const externalPeriod = useSelector(
        (state) => state.ui?.activeTimelinePeriod
    )

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
        renderingStrategy,
        valuesByPeriod,
        periods,
        legendDecimalPlaces,
    } = layer || EMPTY_LAYER

    const isMultiPeriodThematic =
        layerType === THEMATIC_LAYER &&
        renderingStrategy &&
        renderingStrategy !== RENDERING_STRATEGY_SINGLE
    const isTimelineThematic =
        isMultiPeriodThematic &&
        renderingStrategy === RENDERING_STRATEGY_TIMELINE
    const isStyledEvent = layerType === EVENT_LAYER && !!styleDataItem

    const boundsDependency = showOnlyFeaturesInView ? mapBounds : null

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

        const inViewData = showOnlyFeaturesInView
            ? allData.filter((d) => isFeatureInBounds(d, mapBounds))
            : allData

        if (layerType === GEOJSON_URL_LAYER) {
            return inViewData.map((d) => ({
                ...d.properties,
            }))
        }

        return inViewData
            .filter((d) => !d.properties.hasAdditionalGeometry)
            .map((d, index) => {
                const properties = d.properties || d

                if (isStyledEvent) {
                    // The event's own styling pass already classified this
                    // feature into legend.items[colorGroup] (color/radius) -
                    // Legend/Range are just a lookup, not new classification.
                    const legendItem = legend?.items?.[properties.colorGroup]
                    return {
                        ...properties,
                        legend: legendItem?.name,
                        range:
                            legendItem && 'startValue' in legendItem
                                ? formatRangeWithSeparator(
                                      legendItem,
                                      keyAnalysisDigitGroupSeparator,
                                      { precision: legendDecimalPlaces }
                                  )
                                : undefined,
                        ...aggregations[d.id],
                        index,
                    }
                }

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
                const otherPeriodValues = {}
                ;(periods ?? []).forEach((period) => {
                    if (
                        isTimelineThematic &&
                        period.id === externalPeriod?.id
                    ) {
                        return
                    }
                    otherPeriodValues[`period_${period.id}_rawValue`] =
                        valuesByPeriod?.[period.id]?.[orgUnitId]?.value ?? null
                })

                return {
                    ...properties,
                    ...(currentPeriodItem && {
                        rawValue: currentPeriodItem.value,
                        color: currentPeriodItem.color,
                        legend: currentPeriodItem.legend,
                        range: currentPeriodItem.range,
                    }),
                    ...otherPeriodValues,
                    ...aggregations[d.id],
                    index,
                }
            })
        // boundsDependency intentionally proxies mapBounds only while the toggle is on
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data,
        dataWithoutCoords,
        aggregations,
        serverCluster,
        layerType,
        showOnlyFeaturesInView,
        boundsDependency,
        isMultiPeriodThematic,
        isTimelineThematic,
        valuesByPeriod,
        externalPeriod,
        periods,
        isStyledEvent,
        legend,
        keyAnalysisDigitGroupSeparator,
        legendDecimalPlaces,
    ])

    const headers = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        let headers = null
        switch (layerType) {
            case THEMATIC_LAYER:
                headers = isMultiPeriodThematic
                    ? getMultiPeriodThematicHeaders({
                          isTimelineThematic,
                          externalPeriod,
                          periods,
                      })
                    : getThematicHeaders()
                break
            case EVENT_LAYER:
                headers = getEventHeaders({
                    layerHeaders,
                    styleDataItem,
                    countEventsOutsideOrgUnits,
                })
                break
            case ORG_UNIT_LAYER:
                headers = getOrgUnitHeaders(dataWithAggregations)
                break
            case TRACKED_ENTITY_LAYER:
                headers = getTrackedEntityHeaders({ layerHeaders })
                break
            case EARTH_ENGINE_LAYER:
                headers = getEarthEngineHeaders({
                    aggregationType,
                    legend,
                    data: dataWithAggregations,
                })
                break
            case FACILITY_LAYER:
                headers = getFacilityHeaders(dataWithAggregations)
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
        isMultiPeriodThematic,
        isTimelineThematic,
        externalPeriod,
        periods,
    ])

    const columnOptions = useMemo(() => {
        if (!headers?.length || !dataWithAggregations?.length) {
            return EMPTY_COLUMN_OPTIONS
        }

        const result = {}
        headers.forEach(({ dataKey, type }) => {
            const seen = new Set()
            for (const item of dataWithAggregations) {
                const val = item[dataKey]
                seen.add(
                    val === undefined || val === null || val === ''
                        ? SENTINEL_NO_VALUE
                        : String(val)
                )
            }

            if (seen.size > 0) {
                const direction =
                    dataKey === sortField ? sortDirection : SORT_ASCENDING
                result[dataKey] = Array.from(seen)
                    .sort((a, b) =>
                        compareColumnOptionValues(a, b, {
                            dataKey,
                            type,
                            direction,
                        })
                    )
                    .map((value) => ({ value }))
            }
        })

        return Object.keys(result).length ? result : EMPTY_COLUMN_OPTIONS
    }, [headers, dataWithAggregations, sortField, sortDirection])

    const rows = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        if (!headers.length) {
            errorCode.current = ERROR_NO_HEADERS
            return null
        }

        let filteredData = filterData(dataWithAggregations, dataFilters)

        if (globalSearch?.trim()) {
            const stringDataKeys = headers
                .filter((h) => h.type === TYPE_STRING)
                .map((h) => h.dataKey)
            filteredData = filterByGlobalSearch(
                filteredData,
                globalSearch,
                stringDataKeys
            )
        }

        if (selectionFilter?.length) {
            const wantSelected = selectionFilter.includes(
                SELECTION_FILTER_SELECTED
            )
            const wantNotSelected = selectionFilter.includes(
                SELECTION_FILTER_NOT_SELECTED
            )
            // Both (or neither) checked means "show everything"
            if (wantSelected !== wantNotSelected) {
                filteredData = filteredData.filter(
                    (item) => !!selectedIdSet?.has(item.id) === wantSelected
                )
            }
        }

        //sort
        filteredData.sort((a, b) =>
            compareRows(a, b, { sortField, sortDirection, selectedIdSet })
        )

        return filteredData.map((item) =>
            headers.map(({ dataKey, roundFn, type }) => {
                const value = roundFn ? roundFn(item[dataKey]) : item[dataKey]

                return {
                    dataKey,
                    value: type === TYPE_NUMBER && isNaN(value) ? null : value,
                    align: type === TYPE_NUMBER ? 'right' : 'left',
                    itemId: item.id,
                }
            })
        )
    }, [
        headers,
        dataWithAggregations,
        dataFilters,
        globalSearch,
        sortField,
        sortDirection,
        selectionFilter,
        selectedIdSet,
    ])

    // EE layers and event layers may be loading additional data
    const isLoadingAggregations =
        layerType === EARTH_ENGINE_LAYER &&
        aggregationType?.length &&
        (!aggregations || aggregations === EMPTY_AGGREGATIONS)
    const isExtendingEvents =
        layerType === EVENT_LAYER && !layer.isExtended && !serverCluster
    const isLoading = isLoadingAggregations || isExtendingEvents
    let loadingReason = null
    if (isLoadingAggregations) {
        loadingReason = i18n.t('Loading Earth Engine data…')
    } else if (isExtendingEvents) {
        loadingReason = i18n.t('Loading additional events…')
    }

    const totalCount = dataWithAggregations?.length ?? 0
    const filteredCount = rows?.length ?? 0

    return {
        headers,
        rows,
        isLoading,
        loadingReason,
        error: getErrorCodeText(errorCode.current),
        totalCount,
        filteredCount,
        columnOptions,
    }
}
