import i18n from '@dhis2/d2-i18n'
import { useDeferredValue, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
    SENTINEL_SELECTED_ROW,
    SORT_ASCENDING,
} from '../../constants/dataTable.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    EARTH_ENGINE_LAYER,
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
} from '../../constants/layers.js'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../constants/selection.js'
import { filterByGlobalSearch, filterData } from '../../util/filter.js'
import {
    buildRowCells,
    getColumnDistinctValues,
} from '../../util/tableColumns.js'
import {
    TYPE_STRING,
    ERROR_NON_HOMOGENOUS_FEATURES,
    getHeadersForLayer,
} from '../../util/tableHeaders.js'
import {
    ERROR_SERVER_CLUSTER,
    ERROR_NO_VALID_DATA,
    buildTableData,
} from '../../util/tableRows.js'
import { compareColumnOptionValues, compareRows } from '../../util/tableSort.js'

const ERROR_NO_HEADERS = 'NO_HEADERS'

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
    const selectedIdSetDependency =
        sortField === SENTINEL_SELECTED_ROW || selectionFilter?.length
            ? selectedIdSet
            : null
    const periodsDependency = isMultiPeriodThematic ? periods : null
    const valuesByPeriodDependency = isMultiPeriodThematic
        ? valuesByPeriod
        : null
    const externalPeriodDependency = isTimelineThematic ? externalPeriod : null

    const dataWithAggregations = useMemo(() => {
        const { data: rows, errorCode: rowsErrorCode } = buildTableData(
            layerType,
            {
                data,
                dataWithoutCoords,
                serverCluster,
                showOnlyFeaturesInView,
                mapBounds,
                aggregations,
                isStyledEvent,
                isMultiPeriodThematic,
                isTimelineThematic,
                legend,
                valuesByPeriod,
                externalPeriod,
                periods,
                keyAnalysisDigitGroupSeparator,
                legendDecimalPlaces,
            }
        )

        errorCode.current = rowsErrorCode ?? null
        return rowsErrorCode ? null : rows
        // *Dependency vars proxy their raw counterparts (see above)
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
        valuesByPeriodDependency,
        externalPeriodDependency,
        periodsDependency,
        isStyledEvent,
        legend,
        keyAnalysisDigitGroupSeparator,
        legendDecimalPlaces,
    ])

    const headers = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        const { headers, errorCode: headersErrorCode } = getHeadersForLayer(
            layerType,
            {
                isMultiPeriodThematic,
                isTimelineThematic,
                externalPeriod,
                periods,
                layerHeaders,
                styleDataItem,
                countEventsOutsideOrgUnits,
                aggregationType,
                legend,
                data: dataWithAggregations,
                rawData: data,
            }
        )

        if (headersErrorCode) {
            errorCode.current = headersErrorCode
            return null
        }

        if (!headers?.length) {
            errorCode.current = ERROR_NO_HEADERS
            return null
        }
        return headers
        // *Dependency vars proxy their raw counterparts (see above)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        externalPeriodDependency,
        periodsDependency,
    ])

    // Expensive: scans every row once per column
    const deferredDataForOptions = useDeferredValue(dataWithAggregations)
    const columnDistinctValues = useMemo(
        () => getColumnDistinctValues(headers, deferredDataForOptions),
        [headers, deferredDataForOptions]
    )

    // Cheap: just re-orders each column's already-known distinct-value list
    const columnOptions = useMemo(() => {
        if (!columnDistinctValues) {
            return EMPTY_COLUMN_OPTIONS
        }

        const result = {}
        Object.entries(columnDistinctValues).forEach(
            ([dataKey, { values, type }]) => {
                const direction =
                    dataKey === sortField ? sortDirection : SORT_ASCENDING
                result[dataKey] = [...values]
                    .sort((a, b) =>
                        compareColumnOptionValues(a, b, {
                            dataKey,
                            type,
                            direction,
                        })
                    )
                    .map((value) => ({ value }))
            }
        )

        return Object.keys(result).length ? result : EMPTY_COLUMN_OPTIONS
    }, [columnDistinctValues, sortField, sortDirection])

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

        return filteredData.map((item) => buildRowCells(item, headers))
        // *Dependency vars proxy their raw counterparts (see above)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        headers,
        dataWithAggregations,
        dataFilters,
        globalSearch,
        sortField,
        sortDirection,
        selectionFilter,
        selectedIdSetDependency,
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
