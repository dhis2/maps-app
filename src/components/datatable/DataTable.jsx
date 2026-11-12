import i18n from '@dhis2/d2-i18n'
import {
    DataTableRow,
    ComponentCover,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, {
    useReducer,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { highlightFeature } from '../../actions/feature.js'
import { editLayer, setForceClientCluster } from '../../actions/layers.js'
import { SORT_ASCENDING, TYPE_NUMBER } from '../../constants/dataTable.js'
import {
    getFilterType,
    getNextSorting,
    getRowId,
    hasActiveDataTableFilters,
    isFilterable,
    shouldClearFeatureHighlight,
} from '../../util/dataTable.js'
import { formatCellText } from '../../util/tableCells.js'
import { getVisibleHeaders } from '../../util/tableColumns.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import ColumnHeader from './ColumnHeader.jsx'
import ActiveFiltersBar from './filters/ActiveFiltersBar.jsx'
import FilterButton from './filters/FilterButton.jsx'
import RowCells from './RowCells.jsx'
import styles from './styles/DataTable.module.css'
import TableComponents from './TableVirtuosoComponents.jsx'
import { useColumnWidths } from './useColumnWidths.js'
import { useTableData } from './useTableData.js'

const EMPTY_OPTIONS = []
const EMPTY_COUNTS = new Map()

// The column's values, labelled as its cells, for the options filter
const getFilterColumn = (
    { dataKey, type, renderer, optionSet },
    {
        columnOptions,
        columnValueCounts,
        orgUnitIdToName,
        keyAnalysisDigitGroupSeparator,
    }
) => ({
    options: columnOptions[dataKey] ?? EMPTY_OPTIONS,
    counts: columnValueCounts[dataKey] ?? EMPTY_COUNTS,
    optionSetId: optionSet?.id,
    renderer,
    formatValue: (value) =>
        formatCellText(type === TYPE_NUMBER ? Number(value) : value, {
            renderer,
            type,
            orgUnitIdToName,
            keyAnalysisDigitGroupSeparator,
        }),
})

const TABLE_STYLE = { height: '100%', width: '100%' }
const VIEWPORT_OVERSCAN = { top: 400, bottom: 400 }

const Table = ({
    availableWidth,
    onCountChange,
    onHeadersChange,
    onClearFilters,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: 'name',
            sortDirection: SORT_ASCENDING,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)
    const { id: layerId, dataFilters } = layer

    const sortData = useCallback(
        ({ name }) => {
            setSorting(getNextSorting(name, { sortField, sortDirection }))
        },
        [sortField, sortDirection]
    )

    // Read via ref rather than a dependency, so this callback stays stable
    // across hovers instead of getting a new identity on every single mouse-enter
    const featureRef = useRef(feature)
    featureRef.current = feature

    const setFeatureHighlight = useCallback(
        (row) => {
            const id = getRowId(row)
            const currentFeature = featureRef.current

            if (!id || !currentFeature || id !== currentFeature.id) {
                dispatch(
                    highlightFeature(
                        id
                            ? {
                                  id,
                                  layerId: layer.id,
                                  origin: 'table',
                              }
                            : null
                    )
                )
            }
        },
        [dispatch, layer.id]
    )
    const clearFeatureHighlight = useCallback(
        (event) => {
            if (shouldClearFeatureHighlight(event)) {
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const {
        headers,
        rows,
        isLoading,
        loadingReason,
        error,
        totalCount,
        filteredCount,
        columnOptions,
        columnValueCounts,
        orgUnitIdToName,
    } = useTableData({
        layer,
        sortField,
        sortDirection,
        keyAnalysisDigitGroupSeparator,
    })

    useEffect(() => {
        onHeadersChange?.(headers, layer.id)
    }, [onHeadersChange, headers, layer.id])

    const columnConfig = layer.dataTableColumnConfig

    const visibleHeaders = useMemo(
        () => getVisibleHeaders(headers, columnConfig) ?? [],
        [headers, columnConfig]
    )

    const rendererByDataKey = useMemo(
        () => new Map(visibleHeaders.map((h) => [h.dataKey, h.renderer])),
        [visibleHeaders]
    )

    const typeByDataKey = useMemo(
        () => new Map(visibleHeaders.map((h) => [h.dataKey, h.type])),
        [visibleHeaders]
    )

    const { headerRowRef, columnWidths } = useColumnWidths({
        availableWidth,
        headers: visibleHeaders,
        error,
    })

    useEffect(() => {
        onCountChange?.(totalCount, filteredCount)
    }, [onCountChange, totalCount, filteredCount])

    const hasActiveFilters = hasActiveDataTableFilters({
        dataFilters: layer.dataFilters,
    })

    const showServerClusterAction =
        layer.serverCluster && !layer.forceClientCluster

    const onForceClientCluster = useCallback(
        () => dispatch(setForceClientCluster(layer.id)),
        [dispatch, layer.id]
    )

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
            totalCount,
            hasActiveFilters,
            onClearFilters,
            showServerClusterAction,
            onForceClientCluster,
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            columnWidths,
            totalCount,
            hasActiveFilters,
            onClearFilters,
            showServerClusterAction,
            onForceClientCluster,
        ]
    )

    const computeItemKey = useCallback(
        (index, row) => getRowId(row) ?? index,
        []
    )

    const getColumn = useCallback(
        (header) =>
            getFilterColumn(header, {
                columnOptions,
                columnValueCounts,
                orgUnitIdToName,
                keyAnalysisDigitGroupSeparator,
            }),
        [
            columnOptions,
            columnValueCounts,
            orgUnitIdToName,
            keyAnalysisDigitGroupSeparator,
        ]
    )

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow ref={headerRowRef}>
                {visibleHeaders.map((header, index) => {
                    const { name, dataKey, type } = header

                    return (
                        <ColumnHeader
                            className={styles.columnHeader}
                            key={`${dataKey}-${index}`}
                            name={name}
                            dataKey={dataKey}
                            sortDirection={
                                dataKey === sortField ? sortDirection : null
                            }
                            onSort={sortData}
                            filterButton={
                                isFilterable(dataKey, type) && (
                                    <FilterButton
                                        layerId={layerId}
                                        name={name}
                                        dataKey={dataKey}
                                        filterType={getFilterType(header)}
                                        column={getColumn(header)}
                                        filter={dataFilters?.[dataKey]}
                                    />
                                )
                            }
                            width={
                                columnWidths.length > 0
                                    ? `${columnWidths[index]}px`
                                    : 'auto'
                            }
                        />
                    )
                })}
            </DataTableRow>
        ),
        [
            sortData,
            sortField,
            sortDirection,
            visibleHeaders,
            columnWidths,
            getColumn,
            headerRowRef,
            layerId,
            dataFilters,
        ]
    )

    const itemContent = useCallback(
        (_, row) => (
            <RowCells
                row={row}
                visibleHeaders={visibleHeaders}
                hoveredFeature={feature}
                layerId={layer.id}
                rendererByDataKey={rendererByDataKey}
                typeByDataKey={typeByDataKey}
                keyAnalysisDigitGroupSeparator={keyAnalysisDigitGroupSeparator}
                orgUnitIdToName={orgUnitIdToName}
            />
        ),
        [
            visibleHeaders,
            feature,
            layer.id,
            rendererByDataKey,
            typeByDataKey,
            keyAnalysisDigitGroupSeparator,
            orgUnitIdToName,
        ]
    )

    if (error) {
        return (
            <p className={styles.noSupport}>
                {error}
                <button
                    type="button"
                    className={styles.editLayerLink}
                    onClick={() => dispatch(editLayer(layer))}
                >
                    {i18n.t('Edit layer')}
                </button>
            </p>
        )
    }

    return (
        <>
            <div className={styles.tableLayout}>
                <ActiveFiltersBar
                    layerId={layerId}
                    filters={dataFilters}
                    headers={headers}
                    getColumn={getColumn}
                />
                <div className={styles.tableBody}>
                    <TableVirtuoso
                        context={tableContext}
                        components={TableComponents}
                        style={TABLE_STYLE}
                        data={rows}
                        computeItemKey={computeItemKey}
                        increaseViewportBy={VIEWPORT_OVERSCAN}
                        fixedHeaderContent={fixedHeaderContent}
                        itemContent={itemContent}
                    />
                </div>
            </div>
            {(isLoading || layer?.isLoaded === false || layer?.isLoading) && (
                <ComponentCover translucent>
                    <CenteredContent>
                        <div className={styles.loadingContent}>
                            <CircularLoader invert />
                            {loadingReason && (
                                <span className={styles.loadingReason}>
                                    {loadingReason}
                                </span>
                            )}
                        </div>
                    </CenteredContent>
                </ComponentCover>
            )}
        </>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
    onClearFilters: PropTypes.func,
    onCountChange: PropTypes.func,
    onHeadersChange: PropTypes.func,
}

export default Table
