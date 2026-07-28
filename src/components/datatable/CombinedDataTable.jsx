import i18n from '@dhis2/d2-i18n'
import { DataTableRow, DataTableCell } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { highlightFeature } from '../../actions/feature.js'
import { setCrossLayerSelection } from '../../actions/selection.js'
import {
    COMBINED_HEADERS_KEY,
    ORG_UNIT_ID_DATA_KEY,
} from '../../constants/dataTable.js'
import {
    isFilterable,
    getRowId,
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
const NOOP = () => {}

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

// Reuse the same generic TableVirtuoso row/table wiring DataTable.jsx uses
// (context-driven mouse/click callbacks) - only the empty-state message
// differs, since Combined doesn't have DataTable's server-cluster/
// clear-filters messaging needs yet.
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
    // Earth Engine layers compute their value(s) client-side into this
    // slice rather than attaching them to the feature itself - see
    // useCombinedTableData.js's own mergeAggregations.
    const aggregations = useSelector((state) => state.aggregations)

    const { sortField, sortDirection, sortData } = useSortState('name')

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
        })

    useEffect(() => {
        onHeadersChange?.(headers, COMBINED_HEADERS_KEY)
    }, [onHeadersChange, headers])

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

    // Combined rows don't belong to any single layer, so selection/hover
    // here can't reuse state.selection/state.feature's single-layerId shape
    // directly - it dispatches the same actions but with crossLayerIds (a
    // per-layer id map merged from every affected row), and layerId: null so
    // Layer.js's own-layer check never matches. The in-table
    // selected/hovered highlighting stays local state; only the map-facing
    // dispatch goes through Redux.
    const [selectedIds, setSelectedIds] = useState([])
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
    const [hoveredRowId, setHoveredRowId] = useState(null)

    // Only clear state.selection on unmount if this table ever actually set
    // a cross-layer selection - otherwise merely opening and closing the
    // Combined tab without selecting anything would wipe out an unrelated,
    // pre-existing single-layer selection made in another tab.
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
        !!globalSearch?.trim()

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
            onRowDoubleClick: NOOP,
            layout: 'auto',
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            onRowClick,
            onRowContextMenu,
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
                context={tableContext}
                components={CombinedTableComponents}
                style={TABLE_STYLE}
                data={rows}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={(_, row) => {
                    const rowId = getRowId(row)
                    const isSelected = !!rowId && selectedIdSet.has(rowId)
                    const isHovered = !!rowId && rowId === hoveredRowId
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
