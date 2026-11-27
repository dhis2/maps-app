import i18n from '@dhis2/d2-i18n'
import { useDeferredValue, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
} from '../../constants/dataTable.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    EARTH_ENGINE_LAYER,
    GEOJSON_URL_LAYER,
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
} from '../../constants/layers.js'
import useOrgUnitAncestorNames from '../../hooks/useOrgUnitAncestorNames.js'
import { filterData } from '../../util/filter.js'
import { buildKnownOrgUnitNames } from '../../util/orgUnits.js'
import {
    buildRowCells,
    getColumnDistinctValues,
    sortColumnOptions,
} from '../../util/tableColumns.js'
import {
    ERROR_NON_HOMOGENOUS_FEATURES,
    getHeadersForLayer,
} from '../../util/tableHeaders.js'
import { ERROR_NO_VALID_DATA, buildTableData } from '../../util/tableRows.js'
import {
    compareRows,
    getLegendRank,
    isLegendColumn,
} from '../../util/tableSort.js'

const ERROR_NO_HEADERS = 'NO_HEADERS'

// External layers come with their features: editing the layer can't add any
const getNoDataMessage = (layerType) => ({
    title: i18n.t('No data to show'),
    description:
        layerType === GEOJSON_URL_LAYER
            ? i18n.t('This external layer has no features.')
            : i18n.t('This layer has no features for its current settings.'),
})

// The two last cases only happen on external layers, whose columns come from their features
const getErrorMessage = (code, layerType) => {
    switch (code) {
        case ERROR_NO_VALID_DATA:
            return getNoDataMessage(layerType)
        case ERROR_NON_HOMOGENOUS_FEATURES:
            return {
                title: i18n.t('Data table not available'),
                description: i18n.t(
                    'The data table cannot show an external layer with more than one geometry type.'
                ),
            }
        case ERROR_NO_HEADERS:
            return {
                title: i18n.t('No data to show'),
                description: i18n.t(
                    "This external layer's features have no properties to show."
                ),
            }
        default:
            return null
    }
}

const EMPTY_AGGREGATIONS = {}
const EMPTY_LAYER = {}
const EMPTY_COLUMN_OPTIONS = {}

export const useTableData = ({ layer, sortField, sortDirection }) => {
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
    } = layer || EMPTY_LAYER

    const isMultiPeriodThematic =
        layerType === THEMATIC_LAYER &&
        renderingStrategy &&
        renderingStrategy !== RENDERING_STRATEGY_SINGLE
    const isTimelineThematic =
        isMultiPeriodThematic &&
        renderingStrategy === RENDERING_STRATEGY_TIMELINE

    // Period inputs only count for the layers that show them, so other
    // layers don't recompute the memos below when they change
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
                aggregations,
                isMultiPeriodThematic,
                isTimelineThematic,
                valuesByPeriod,
                externalPeriod,
                periods,
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
        isMultiPeriodThematic,
        isTimelineThematic,
        valuesByPeriodDependency,
        externalPeriodDependency,
        periodsDependency,
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
        periodsDependency,
    ])

    // Expensive: scans every row once per column
    const deferredDataForOptions = useDeferredValue(dataWithAggregations)
    const columnDistinctValues = useMemo(
        () => getColumnDistinctValues(headers, deferredDataForOptions),
        [headers, deferredDataForOptions]
    )

    // Cheap: just re-orders each column's already-known distinct-value list
    const columnOptions = useMemo(
        () =>
            sortColumnOptions(columnDistinctValues, {
                sortField,
                sortDirection,
            }) ?? EMPTY_COLUMN_OPTIONS,
        [columnDistinctValues, sortField, sortDirection]
    )

    const orgUnitPathValues = useMemo(
        () =>
            (headers ?? [])
                .filter((h) =>
                    [RENDERER_ORG_UNIT, RENDERER_ORG_UNIT_NAME].includes(
                        h.renderer
                    )
                )
                .flatMap((h) =>
                    (columnOptions[h.dataKey] ?? []).map((o) => o.value)
                ),
        [headers, columnOptions]
    )
    const knownOrgUnitNames = useMemo(
        () => buildKnownOrgUnitNames(dataWithAggregations),
        [dataWithAggregations]
    )
    const { idToName: orgUnitIdToName, loading: isLoadingNames } =
        useOrgUnitAncestorNames(orgUnitPathValues, knownOrgUnitNames)
    // Org unit columns show ids until their names arrive, and sort by those names
    const isWaitingForNames =
        isLoadingNames || deferredDataForOptions !== dataWithAggregations

    const rows = useMemo(() => {
        if (errorCode.current) {
            return null
        }

        if (!headers.length) {
            errorCode.current = ERROR_NO_HEADERS
            return null
        }

        const filteredData = filterData(dataWithAggregations, dataFilters)

        // Sort
        const sortHeader = headers.find((h) => h.dataKey === sortField)
        const getRank = isLegendColumn(sortHeader)
            ? getLegendRank(legend?.items)
            : null
        filteredData.sort((a, b) =>
            compareRows(a, b, {
                sortField,
                sortDirection,
                orgUnitRenderer: sortHeader?.renderer,
                idToName: orgUnitIdToName,
                getRank,
            })
        )

        return filteredData.map((item) => buildRowCells(item, headers))
    }, [
        headers,
        dataWithAggregations,
        dataFilters,
        sortField,
        sortDirection,
        orgUnitIdToName,
        legend,
    ])

    // EE layers and event layers may be loading additional data
    const isLoadingAggregations =
        layerType === EARTH_ENGINE_LAYER &&
        aggregationType?.length &&
        (!aggregations || aggregations === EMPTY_AGGREGATIONS)
    const isExtendingEvents =
        layerType === EVENT_LAYER &&
        !layer.isExtended &&
        !!(!serverCluster || layer.forceClientCluster)
    const isLoading =
        isLoadingAggregations || isExtendingEvents || isWaitingForNames
    let loadingReason = null
    if (isLoadingAggregations) {
        loadingReason = i18n.t('Loading Earth Engine data…')
    } else if (isExtendingEvents) {
        loadingReason = i18n.t('Loading additional events…')
    }

    const totalCount = dataWithAggregations?.length ?? 0
    const filteredCount = rows?.length ?? 0

    // Stable objects: the table context and column widths depend on them
    const currentErrorCode = errorCode.current
    const error = useMemo(
        () => getErrorMessage(currentErrorCode, layerType),
        [currentErrorCode, layerType]
    )
    const noDataMessage = useMemo(
        () => getNoDataMessage(layerType),
        [layerType]
    )

    return {
        headers,
        rows,
        isLoading,
        loadingReason,
        error,
        noDataMessage,
        totalCount,
        filteredCount,
        orgUnitIdToName,
        columnOptions,
        // Every row before the filters: the filter popovers count their values from them
        filterRows: dataWithAggregations,
    }
}
