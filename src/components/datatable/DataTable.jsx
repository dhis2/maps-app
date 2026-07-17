import i18n from '@dhis2/d2-i18n'
import {
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    ComponentCover,
    CenteredContent,
    CircularLoader,
    IconSync16,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, {
    useReducer,
    useCallback,
    useMemo,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { setSelectionFilter } from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'
import {
    toggleFeatureSelection,
    selectFeatureRange,
} from '../../actions/selection.js'
import {
    SENTINEL_SELECTED_ROW,
    SORT_ASCENDING,
} from '../../constants/dataTable.js'
import { isDarkColor } from '../../util/colors.js'
import {
    getNextSorting,
    getRowClickAction,
    getRowId,
    isFilterable,
    shouldClearFeatureHighlight,
} from '../../util/dataTable.js'
import { formatWithSeparator } from '../../util/numbers.js'
import {
    getPinnedCellProps,
    getPinnedCount,
    getPinnedLeftOffsets,
    getVisibleHeaders,
} from '../../util/tableColumns.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SortIcon } from '../core/icons.jsx'
import FilterInput from './FilterInput.jsx'
import SelectionFilterButton from './SelectionFilterButton.jsx'
import styles from './styles/DataTable.module.css'
import TableContextMenu from './TableContextMenu.jsx'
import TableComponents from './TableVirtuosoComponents.jsx'
import TopTooltip from './TopTooltip.jsx'
import { useColumnWidths } from './useColumnWidths.js'
import { useRowSelection } from './useRowSelection.js'
import { useTableData } from './useTableData.js'

const Table = ({
    availableWidth,
    onCountChange,
    onHeadersChange,
    globalSearch,
    onClearFilters,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const virtuosoRef = useRef(null)
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const selection = useSelector((state) => state.selection)
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const mapBounds = useSelector((state) => state.ui.mapBounds)
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: 'name',
            sortDirection: SORT_ASCENDING,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)

    const sortData = useCallback(
        ({ name }) => {
            setSorting(getNextSorting(name, { sortField, sortDirection }))
        },
        [sortField, sortDirection]
    )

    const setFeatureHighlight = useCallback(
        (row) => {
            const id = getRowId(row)

            if (!id || !feature || id !== feature.id) {
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
        [feature, dispatch, layer.id]
    )
    const clearFeatureHighlight = useCallback(
        (event) => {
            if (shouldClearFeatureHighlight(event)) {
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const featureById = useMemo(() => {
        const map = new Map()
        layer.data?.forEach((f) => {
            const id = f.properties?.id ?? f.id
            if (id != null) {
                map.set(id, f)
            }
        })
        return map
    }, [layer.data])

    const [tableContextMenu, setTableContextMenu] = useState(null)

    const onRowContextMenu = useCallback(
        (e, row) => {
            e.preventDefault()
            const id = getRowId(row)
            const feature = featureById.get(id)
            setTableContextMenu({
                x: e.clientX,
                y: e.clientY,
                featureProps: feature?.properties ?? { id },
            })
        },
        [featureById]
    )

    const selectedIds = useMemo(
        () => (selection.layerId === layer.id ? selection.ids : []),
        [selection, layer.id]
    )
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

    const {
        headers,
        rows,
        isLoading,
        loadingReason,
        error,
        totalCount,
        filteredCount,
        columnOptions,
    } = useTableData({
        layer,
        sortField,
        sortDirection,
        showOnlyFeaturesInView,
        mapBounds,
        selectionFilter,
        selectedIdSet,
        globalSearch,
    })

    useEffect(() => {
        onHeadersChange?.(headers, layer.id)
    }, [onHeadersChange, headers, layer.id])

    const columnConfig = layer.dataTableColumnConfig
    const pinnedKeys = useMemo(
        () => columnConfig?.pinnedKeys ?? [],
        [columnConfig]
    )

    const visibleHeaders = useMemo(
        () => getVisibleHeaders(headers, columnConfig),
        [headers, columnConfig]
    )

    const { headerRowRef, columnWidths } = useColumnWidths({
        availableWidth,
        headers: visibleHeaders,
        error,
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
        onCountChange?.(totalCount, filteredCount)
    }, [onCountChange, totalCount, filteredCount])

    const lastClickedRowIndexRef = useRef(null)

    const onRowClick = useCallback(
        (row, event) => {
            const id = getRowId(row)

            if (!id || !rows) {
                return
            }

            const rowIndex = rows.findIndex((r) => getRowId(r) === id)
            const action = getRowClickAction(event, {
                id,
                rowIndex,
                rows,
                lastClickedRowIndex: lastClickedRowIndexRef.current,
            })

            if (!action) {
                return
            }

            if (action.type === 'range') {
                dispatch(selectFeatureRange(action.ids, layer.id))
            } else {
                dispatch(toggleFeatureSelection(action.id, layer.id))
            }
            lastClickedRowIndexRef.current = rowIndex
        },
        [dispatch, layer.id, rows]
    )

    const onRowDoubleClick = useCallback(
        (row) => {
            const id = getRowId(row)

            if (!id) {
                return
            }

            dispatch(
                highlightFeature({
                    id,
                    layerId: layer.id,
                    origin: 'table',
                    zoom: true,
                })
            )
        },
        [dispatch, layer.id]
    )

    const hasActiveFilters =
        Object.keys(layer.dataFilters ?? {}).length > 0 ||
        !!globalSearch?.trim() ||
        selectionFilter?.length > 0

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            onContextMenu: onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
            totalCount,
            hasActiveFilters,
            onClearFilters,
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            columnWidths,
            totalCount,
            hasActiveFilters,
            onClearFilters,
        ]
    )

    const lastClickedFeature = useSelector(
        (state) => state.ui.lastClickedFeature
    )
    const rowsRef = useRef(rows)
    rowsRef.current = rows
    useEffect(() => {
        if (!lastClickedFeature || lastClickedFeature.layerId !== layer.id) {
            return
        }
        const currentRows = rowsRef.current
        if (!currentRows) {
            return
        }
        const rowIndex = currentRows.findIndex(
            (row) => getRowId(row) === lastClickedFeature.id
        )
        if (rowIndex !== -1) {
            virtuosoRef.current?.scrollToIndex({
                index: rowIndex,
                align: 'center',
                behavior: 'smooth',
            })
        }
    }, [lastClickedFeature, layer.id])

    const allRowIds = useMemo(
        () => rows?.map(getRowId).filter(Boolean) ?? [],
        [rows]
    )

    const { isAllSelected, onToggleSelectAll, onReverseSelection } =
        useRowSelection({
            selectedIds,
            selectedIdSet,
            allRowIds,
            layerId: layer.id,
        })

    if (error) {
        return <p className={styles.noSupport}>{error}</p>
    }

    return (
        <>
            <TableVirtuoso
                ref={virtuosoRef}
                context={tableContext}
                components={TableComponents}
                style={{
                    height: '100%',
                    width: '100%',
                }}
                data={rows}
                computeItemKey={(index, row) => getRowId(row) ?? index}
                increaseViewportBy={{ top: 400, bottom: 400 }}
                fixedHeaderContent={() => (
                    <DataTableRow ref={headerRowRef}>
                        <DataTableColumnHeader
                            className={styles.checkboxCell}
                            width="76px"
                            fixed={isCheckboxColumnPinned}
                            left={isCheckboxColumnPinned ? '0px' : undefined}
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
                        >
                            <div className={styles.checkboxHeaderContent}>
                                <TopTooltip
                                    content={i18n.t('Select all visible rows')}
                                >
                                    <input
                                        type="checkbox"
                                        aria-label={i18n.t(
                                            'Select all visible rows'
                                        )}
                                        checked={isAllSelected}
                                        onChange={onToggleSelectAll}
                                    />
                                </TopTooltip>
                                <TopTooltip
                                    content={i18n.t(
                                        'Reverse selection of visible rows'
                                    )}
                                >
                                    <button
                                        type="button"
                                        className={styles.reverseButton}
                                        data-test="data-table-reverse-selection"
                                        disabled={allRowIds.length === 0}
                                        onClick={onReverseSelection}
                                    >
                                        <IconSync16 />
                                    </button>
                                </TopTooltip>
                                <TopTooltip
                                    content={i18n.t('Sort by Selected')}
                                >
                                    <button
                                        type="button"
                                        className={styles.sortButton}
                                        data-test="data-table-column-sort-button-selected"
                                        onClick={() =>
                                            sortData({
                                                name: SENTINEL_SELECTED_ROW,
                                            })
                                        }
                                    >
                                        <SortIcon
                                            direction={
                                                sortField ===
                                                SENTINEL_SELECTED_ROW
                                                    ? sortDirection
                                                    : null
                                            }
                                        />
                                    </button>
                                </TopTooltip>
                            </div>
                        </DataTableColumnHeader>
                        {visibleHeaders.map(
                            ({ name, dataKey, type, optionSet }, index) => {
                                const { fixed, left, isLastPinned } =
                                    getPinnedCellProps(dataKey, index, {
                                        pinnedLeftOffsets,
                                        pinnedColumnCount,
                                        columnWidths,
                                    })
                                return (
                                    <DataTableColumnHeader
                                        className={cx(styles.columnHeader, {
                                            [styles.pinnedColumnShadow]:
                                                isLastPinned,
                                        })}
                                        key={`${dataKey}-${index}`}
                                        fixed={fixed}
                                        left={left}
                                        onFilterIconClick={
                                            isFilterable(dataKey, type) &&
                                            Function.prototype
                                        }
                                        showFilter={isFilterable(dataKey, type)}
                                        name={dataKey}
                                        filter={
                                            isFilterable(dataKey, type) && (
                                                <FilterInput
                                                    type={type}
                                                    dataKey={dataKey}
                                                    name={name}
                                                    options={
                                                        columnOptions[dataKey]
                                                    }
                                                    optionSetId={optionSet?.id}
                                                />
                                            )
                                        }
                                        width={
                                            columnWidths.length > 0
                                                ? `${columnWidths[index]}px`
                                                : 'auto'
                                        }
                                    >
                                        <span className={styles.headerContent}>
                                            {name}
                                            <TopTooltip
                                                content={i18n.t(
                                                    'Sort by {{column}}',
                                                    { column: name }
                                                )}
                                            >
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.sortButton
                                                    }
                                                    data-test={`data-table-column-sort-button-${name}`}
                                                    onClick={() =>
                                                        sortData({
                                                            name: dataKey,
                                                        })
                                                    }
                                                >
                                                    <SortIcon
                                                        direction={
                                                            dataKey ===
                                                            sortField
                                                                ? sortDirection
                                                                : null
                                                        }
                                                    />
                                                </button>
                                            </TopTooltip>
                                        </span>
                                    </DataTableColumnHeader>
                                )
                            }
                        )}
                    </DataTableRow>
                )}
                itemContent={(_, row) => {
                    const rowId = getRowId(row)
                    const isSelected = !!rowId && selectedIdSet.has(rowId)
                    const isHovered =
                        !!rowId &&
                        feature?.id === rowId &&
                        feature?.layerId === layer.id

                    const cellsByDataKey = new Map(
                        row.map((cell) => [cell.dataKey, cell])
                    )

                    return (
                        <>
                            <DataTableCell
                                staticStyle
                                fixed={isCheckboxColumnPinned}
                                left={
                                    isCheckboxColumnPinned ? '0px' : undefined
                                }
                                width={
                                    isCheckboxColumnPinned ? '76px' : undefined
                                }
                                className={cx(styles.checkboxCell, {
                                    [styles.selected]: isSelected,
                                    [styles.hovered]: isHovered,
                                })}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                        rowId &&
                                        dispatch(
                                            toggleFeatureSelection(
                                                rowId,
                                                layer.id
                                            )
                                        )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </DataTableCell>
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
                                        key={`dtcell-${dataKey}`}
                                        staticStyle
                                        fixed={fixed}
                                        left={left}
                                        width={width}
                                        className={cx(styles.dataCell, {
                                            [styles.lightText]:
                                                dataKey === 'color' &&
                                                isDarkColor(value),
                                            [styles.monoCell]:
                                                dataKey === 'id' ||
                                                dataKey === 'color',
                                            [styles.selected]:
                                                isSelected &&
                                                dataKey !== 'color',
                                            [styles.hovered]:
                                                isHovered &&
                                                dataKey !== 'color',
                                            [styles.pinnedColumnShadow]:
                                                isLastPinned,
                                        })}
                                        backgroundColor={
                                            dataKey === 'color' ? value : null
                                        }
                                        align={align}
                                    >
                                        {dataKey === 'color'
                                            ? value?.toLowerCase()
                                            : formatWithSeparator(
                                                  value,
                                                  keyAnalysisDigitGroupSeparator
                                              )}
                                    </DataTableCell>
                                )
                            })}
                        </>
                    )
                }}
            />
            {(isLoading || layer?.isLoaded === false || layer?.isLoading) && (
                <ComponentCover>
                    <CenteredContent>
                        <div className={styles.loadingContent}>
                            <CircularLoader />
                            {loadingReason && (
                                <span className={styles.loadingReason}>
                                    {loadingReason}
                                </span>
                            )}
                        </div>
                    </CenteredContent>
                </ComponentCover>
            )}
            <TableContextMenu
                contextMenu={tableContextMenu}
                layer={layer}
                selectedIds={selectedIds}
                filteredIds={hasActiveFilters ? allRowIds : null}
                onClose={() => setTableContextMenu(null)}
            />
        </>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
    globalSearch: PropTypes.string,
    onClearFilters: PropTypes.func,
    onCountChange: PropTypes.func,
    onHeadersChange: PropTypes.func,
}

export default Table
