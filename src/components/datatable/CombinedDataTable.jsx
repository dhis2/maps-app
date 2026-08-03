import i18n from '@dhis2/d2-i18n'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import {
    setCombinedVisibleIds,
    setSelectionFilter,
} from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'
import { setCrossLayerSelection } from '../../actions/selection.js'
import {
    COMBINED_HEADERS_KEY,
    ORG_UNIT_ID_DATA_KEY,
} from '../../constants/dataTable.js'
import {
    isFilterable,
    getRowId,
    getUnionBounds,
    mergeCrossLayerIds,
    shouldClearFeatureHighlight,
} from '../../util/dataTable.js'
import {
    getPinnedCellProps,
    getPinnedCount,
    getPinnedLeftOffsets,
    getVisibleHeaders,
} from '../../util/tableColumns.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import CellValue from './CellValue.jsx'
import CombinedTableContextMenu from './CombinedTableContextMenu.jsx'
import FilterInput from './FilterInput.jsx'
import {
    SelectionCheckboxHeaderCell,
    SelectionCheckboxCell,
} from './SelectionCheckboxColumn.jsx'
import SelectionFilterButton from './SelectionFilterButton.jsx'
import SortableColumnHeader from './SortableColumnHeader.jsx'
import styles from './styles/CombinedDataTable.module.css'
import dataTableStyles from './styles/DataTable.module.css'
import TableComponents from './TableVirtuosoComponents.jsx'
import { useColumnWidths } from './useColumnWidths.js'
import { useCombinedTableData } from './useCombinedTableData.js'
import { useRowClickSelection } from './useRowClickSelection.js'
import { useRowSelection } from './useRowSelection.js'
import { useSortState } from './useSortState.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const LARGE_FEATURE_THRESHOLD_LABEL = '10,000'
const EMPTY_FILTERS = {}

const EmptyPlaceholder = () => (
    <tbody>
        <tr>
            <td colSpan={99999}>
                <div className={styles.noResults}>
                    {i18n.t('No matching rows')}
                </div>
            </td>
        </tr>
    </tbody>
)

const CombinedTableComponents = {
    ...TableComponents,
    EmptyPlaceholder,
}

const CombinedDataTable = ({
    availableWidth,
    layers,
    referenceLayer,
    joinConfig,
    filters,
    onFiltersChange,
    globalSearch,
    onCountChange,
    onHeadersChange,
    columnConfig,
}) => {
    const dispatch = useDispatch()
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const aggregations = useSelector((state) => state.aggregations)
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const mapBounds = useSelector((state) => state.ui.mapBounds)
    const externalPeriod = useSelector(
        (state) => state.ui?.activeTimelinePeriod
    )
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
    const currentFeature = useSelector((state) => state.feature)
    const lastClickedFeature = useSelector(
        (state) => state.ui.lastClickedFeature
    )

    const { sortField, sortDirection, sortData } = useSortState('name')

    const [selectedIds, setSelectedIds] = useState([])
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

    const { headers, rows, rowFeatureIds, columnOptions, spatialWarning } =
        useCombinedTableData({
            layers,
            referenceLayer,
            joinConfig,
            sortField,
            sortDirection,
            filters,
            globalSearch,
            aggregations,
            showOnlyFeaturesInView,
            mapBounds,
            selectionFilter,
            selectedIdSet,
            keyAnalysisDigitGroupSeparator,
            externalPeriod,
        })

    useEffect(() => {
        onHeadersChange?.(headers, COMBINED_HEADERS_KEY)
    }, [onHeadersChange, headers])

    const rowIdByLayerFeature = useMemo(() => {
        const index = new Map()
        rowFeatureIds.forEach((entry, rowId) => {
            Object.entries(entry).forEach(([layerId, ids]) => {
                ids.forEach((id) => index.set(`${layerId}:${id}`, rowId))
            })
        })
        return index
    }, [rowFeatureIds])

    const mapHoveredRowId =
        currentFeature?.origin === 'map' &&
        currentFeature?.id != null &&
        currentFeature?.layerId != null
            ? rowIdByLayerFeature.get(
                  `${currentFeature.layerId}:${currentFeature.id}`
              ) ?? null
            : null

    const pinnedKeys = useMemo(
        () => columnConfig?.pinnedKeys ?? [],
        [columnConfig]
    )

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
    })

    const pinnedColumnCount = useMemo(
        () => getPinnedCount(visibleHeaders, pinnedKeys),
        [visibleHeaders, pinnedKeys]
    )

    const pinnedLeftOffsets = useMemo(
        () => getPinnedLeftOffsets(visibleHeaders, pinnedKeys, columnWidths),
        [visibleHeaders, pinnedKeys, columnWidths]
    )
    const pinnedOffsetsReady = Object.keys(pinnedLeftOffsets).length > 0

    const isCheckboxColumnPinned = pinnedColumnCount > 0 && pinnedOffsetsReady

    useEffect(() => {
        onCountChange?.(rows.length, rows.length)
    }, [onCountChange, rows.length])

    const [hoveredRowId, setHoveredRowId] = useState(null)

    const hasAppliedSelectionRef = useRef(false)

    useEffect(
        () => () => {
            if (hasAppliedSelectionRef.current) {
                dispatch(setCrossLayerSelection({}))
            }
        },
        [dispatch]
    )

    const applySelection = useCallback(
        (nextIds) => {
            setSelectedIds(nextIds)
            hasAppliedSelectionRef.current = true
            dispatch(
                setCrossLayerSelection(
                    mergeCrossLayerIds(nextIds, rowFeatureIds)
                )
            )
        },
        [dispatch, rowFeatureIds]
    )

    const onToggleRow = useCallback(
        (id) =>
            applySelection(
                selectedIds.includes(id)
                    ? selectedIds.filter((i) => i !== id)
                    : [...selectedIds, id]
            ),
        [applySelection, selectedIds]
    )
    const onSelectRowRange = useCallback(
        (ids) => applySelection([...new Set([...selectedIds, ...ids])]),
        [applySelection, selectedIds]
    )
    const onRowClick = useRowClickSelection({
        rows,
        onToggle: onToggleRow,
        onSelectRange: onSelectRowRange,
    })

    const virtuosoRef = useRef(null)
    const rowsRef = useRef(rows)
    rowsRef.current = rows
    const rowIdByLayerFeatureRef = useRef(rowIdByLayerFeature)
    rowIdByLayerFeatureRef.current = rowIdByLayerFeature
    const onToggleRowRef = useRef(onToggleRow)
    onToggleRowRef.current = onToggleRow

    useEffect(() => {
        if (!lastClickedFeature) {
            return
        }
        const rowId = rowIdByLayerFeatureRef.current.get(
            `${lastClickedFeature.layerId}:${lastClickedFeature.id}`
        )
        if (!rowId) {
            return
        }
        if (lastClickedFeature.multiSelect) {
            onToggleRowRef.current(rowId)
        }
        const rowIndex = rowsRef.current.findIndex(
            (row) => getRowId(row) === rowId
        )
        if (rowIndex !== -1) {
            virtuosoRef.current?.scrollToIndex({
                index: rowIndex,
                align: 'center',
                behavior: 'smooth',
            })
        }
    }, [lastClickedFeature])

    const setFeatureHighlight = useCallback(
        (row) => {
            const id = getRowId(row)
            setHoveredRowId(id ?? null)
            const entry = id ? rowFeatureIds.get(id) : null
            dispatch(
                highlightFeature(
                    entry && Object.keys(entry).length
                        ? {
                              layerId: null,
                              origin: 'table',
                              crossLayerIds: entry,
                          }
                        : null
                )
            )
        },
        [dispatch, rowFeatureIds]
    )

    const clearFeatureHighlight = useCallback(
        (event) => {
            if (shouldClearFeatureHighlight(event)) {
                setHoveredRowId(null)
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const onRowDoubleClick = useCallback(
        (row) => {
            const id = getRowId(row)
            if (!id) {
                return
            }
            const entry = rowFeatureIds.get(id) ?? {}
            dispatch(
                highlightFeature({
                    layerId: null,
                    origin: 'table',
                    zoom: true,
                    bounds: getUnionBounds([referenceLayer, ...layers], entry),
                    crossLayerIds: entry,
                })
            )
        },
        [dispatch, rowFeatureIds, referenceLayer, layers]
    )

    const hasColumnOrSearchFilters =
        Object.keys(filters ?? EMPTY_FILTERS).length > 0 ||
        !!globalSearch?.trim()

    const combinedVisibleIdsByLayer = useMemo(() => {
        if (!hasColumnOrSearchFilters) {
            return null
        }
        const idsByLayer = Object.fromEntries(
            [referenceLayer, ...layers].map((layer) => [layer.id, []])
        )
        rows.forEach((row) => {
            const rowId = getRowId(row)
            const entry = rowId ? rowFeatureIds.get(rowId) : null
            if (!entry) {
                return
            }
            Object.entries(entry).forEach(([layerId, ids]) => {
                idsByLayer[layerId]?.push(...ids)
            })
        })
        return idsByLayer
    }, [hasColumnOrSearchFilters, rows, rowFeatureIds, referenceLayer, layers])

    useEffect(() => {
        dispatch(setCombinedVisibleIds(combinedVisibleIdsByLayer))
    }, [dispatch, combinedVisibleIdsByLayer])

    useEffect(
        () => () => {
            dispatch(setCombinedVisibleIds(null))
        },
        [dispatch]
    )

    const allRowIds = useMemo(() => rows.map(getRowId).filter(Boolean), [rows])

    const { isAllSelected, onToggleSelectAll, onReverseSelection } =
        useRowSelection({
            selectedIds,
            selectedIdSet,
            allRowIds,
            onChange: applySelection,
        })

    const hasActiveFilters =
        Object.keys(filters ?? EMPTY_FILTERS).length > 0 ||
        !!globalSearch?.trim() ||
        !!selectionFilter?.length

    const [tableContextMenu, setTableContextMenu] = useState(null)

    const onRowContextMenu = useCallback((e, row) => {
        e.preventDefault()
        const rowId = getRowId(row)
        if (!rowId) {
            return
        }
        setTableContextMenu({ x: e.clientX, y: e.clientY, rowId })
    }, [])

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            onRowClick,
            onContextMenu: onRowContextMenu,
            onRowDoubleClick,
            layout: 'auto',
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            onRowClick,
            onRowContextMenu,
            onRowDoubleClick,
        ]
    )

    const onFilterChange = useCallback(
        (dataKey, value) => {
            onFiltersChange?.({
                ...(filters ?? EMPTY_FILTERS),
                [dataKey]: value,
            })
        },
        [filters, onFiltersChange]
    )

    const onFilterClear = useCallback(
        (dataKey) => {
            const next = { ...(filters ?? EMPTY_FILTERS) }
            delete next[dataKey]
            onFiltersChange?.(next)
        },
        [filters, onFiltersChange]
    )

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow ref={headerRowRef}>
                <SelectionCheckboxHeaderCell
                    fixed={isCheckboxColumnPinned}
                    left={isCheckboxColumnPinned ? '0px' : undefined}
                    isAllSelected={isAllSelected}
                    onToggleSelectAll={onToggleSelectAll}
                    onReverseSelection={onReverseSelection}
                    disabled={allRowIds.length === 0}
                    onFilterIconClick={Function.prototype}
                    showFilter={true}
                    filter={
                        <SelectionFilterButton
                            value={selectionFilter ?? []}
                            onChange={(next) =>
                                dispatch(setSelectionFilter(next))
                            }
                        />
                    }
                />
                {visibleHeaders.map(({ name, dataKey, type }, index) => {
                    const { fixed, left, isLastPinned } = getPinnedCellProps(
                        dataKey,
                        index,
                        { pinnedLeftOffsets, pinnedColumnCount, columnWidths }
                    )
                    return (
                        <SortableColumnHeader
                            key={dataKey}
                            name={name}
                            dataKey={dataKey}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSort={sortData}
                            dataTestPrefix="combined-table-column-sort-button"
                            className={cx(dataTableStyles.columnHeader, {
                                [dataTableStyles.pinnedColumnShadow]:
                                    isLastPinned,
                            })}
                            fixed={fixed}
                            left={left}
                            onFilterIconClick={
                                isFilterable(dataKey, type) &&
                                Function.prototype
                            }
                            showFilter={isFilterable(dataKey, type)}
                            filter={
                                isFilterable(dataKey, type) && (
                                    <FilterInput
                                        type={type}
                                        dataKey={dataKey}
                                        name={name}
                                        options={columnOptions[dataKey]}
                                        filterValue={filters?.[dataKey]}
                                        onChange={(value) =>
                                            onFilterChange(dataKey, value)
                                        }
                                        onClear={() => onFilterClear(dataKey)}
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
            headerRowRef,
            isCheckboxColumnPinned,
            visibleHeaders,
            pinnedLeftOffsets,
            pinnedColumnCount,
            columnWidths,
            filters,
            columnOptions,
            onFilterChange,
            onFilterClear,
            sortData,
            sortField,
            sortDirection,
            isAllSelected,
            onToggleSelectAll,
            onReverseSelection,
            allRowIds,
            selectionFilter,
            dispatch,
        ]
    )

    return (
        <div className={styles.container} style={{ width: availableWidth }}>
            {spatialWarning && (
                <div className={styles.spatialWarning}>
                    {i18n.t(
                        'Spatial join over large datasets may be slow (over {{threshold}} features)',
                        { threshold: LARGE_FEATURE_THRESHOLD_LABEL }
                    )}
                </div>
            )}
            <TableVirtuoso
                ref={virtuosoRef}
                context={tableContext}
                components={CombinedTableComponents}
                style={TABLE_STYLE}
                data={rows}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={(_, row) => {
                    const rowId = getRowId(row)
                    const isSelected = !!rowId && selectedIdSet.has(rowId)
                    const isHovered =
                        !!rowId &&
                        (rowId === hoveredRowId || rowId === mapHoveredRowId)
                    const cellsByDataKey = new Map(
                        row.map((cell) => [cell.dataKey, cell])
                    )
                    return (
                        <>
                            <SelectionCheckboxCell
                                fixed={isCheckboxColumnPinned}
                                left={
                                    isCheckboxColumnPinned ? '0px' : undefined
                                }
                                width={
                                    isCheckboxColumnPinned ? '76px' : undefined
                                }
                                isSelected={isSelected}
                                isHovered={isHovered}
                                onToggle={() => rowId && onToggleRow(rowId)}
                            />
                            {visibleHeaders.map(({ dataKey }, index) => {
                                const cell = cellsByDataKey.get(dataKey)
                                if (!cell) {
                                    return null
                                }
                                const { value, align } = cell
                                const { fixed, left, width, isLastPinned } =
                                    getPinnedCellProps(dataKey, index, {
                                        pinnedLeftOffsets,
                                        pinnedColumnCount,
                                        columnWidths,
                                    })
                                return (
                                    <DataTableCell
                                        key={dataKey}
                                        staticStyle
                                        fixed={fixed}
                                        left={left}
                                        width={width}
                                        align={align}
                                        className={cx(
                                            dataTableStyles.dataCell,
                                            {
                                                [dataTableStyles.monoCell]:
                                                    dataKey === 'id' ||
                                                    dataKey ===
                                                        ORG_UNIT_ID_DATA_KEY,
                                                [dataTableStyles.selected]:
                                                    isSelected,
                                                [dataTableStyles.hovered]:
                                                    isHovered,
                                                [dataTableStyles.pinnedColumnShadow]:
                                                    isLastPinned,
                                            }
                                        )}
                                    >
                                        <CellValue
                                            value={value}
                                            renderer={rendererByDataKey.get(
                                                dataKey
                                            )}
                                            type={typeByDataKey.get(dataKey)}
                                            keyAnalysisDigitGroupSeparator={
                                                keyAnalysisDigitGroupSeparator
                                            }
                                        />
                                    </DataTableCell>
                                )
                            })}
                        </>
                    )
                }}
            />
            <CombinedTableContextMenu
                contextMenu={tableContextMenu}
                layers={layers}
                referenceLayer={referenceLayer}
                rowFeatureIds={rowFeatureIds}
                selectedIds={selectedIds}
                filteredIds={hasActiveFilters ? allRowIds : null}
                onClose={() => setTableContextMenu(null)}
            />
        </div>
    )
}

CombinedDataTable.propTypes = {
    joinConfig: PropTypes.shape({
        layers: PropTypes.object,
    }).isRequired,
    layers: PropTypes.array.isRequired,
    referenceLayer: PropTypes.object.isRequired,
    availableWidth: PropTypes.number,
    columnConfig: PropTypes.shape({
        orderedKeys: PropTypes.arrayOf(PropTypes.string),
        pinnedKeys: PropTypes.arrayOf(PropTypes.string),
        visibleKeys: PropTypes.arrayOf(PropTypes.string),
    }),
    filters: PropTypes.object,
    globalSearch: PropTypes.string,
    onCountChange: PropTypes.func,
    onFiltersChange: PropTypes.func,
    onHeadersChange: PropTypes.func,
}

export default CombinedDataTable
