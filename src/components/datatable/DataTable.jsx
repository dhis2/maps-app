import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableBody,
    ComponentCover,
    CenteredContent,
    CircularLoader,
    Tooltip,
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
import { highlightFeature } from '../../actions/feature.js'
import {
    toggleFeatureSelection,
    selectAllFeatures,
    selectFeatureRange,
    clearSelection,
} from '../../actions/selection.js'
import { isDarkColor } from '../../util/colors.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import { SortIcon } from '../core/icons.jsx'
import FilterInput from './FilterInput.jsx'
import styles from './styles/DataTable.module.css'
import TableContextMenu from './TableContextMenu.jsx'
import { useTableData } from './useTableData.js'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

export const shouldClearFeatureHighlight = (event) =>
    event.relatedTarget?.tagName !== 'TD'

const getRowId = (row) =>
    row.find((r) => r.dataKey === 'id')?.value || row[0]?.itemId

export const getRowClickAction = (
    event,
    { id, rowIndex, rows, lastClickedRowIndex }
) => {
    if (event.shiftKey) {
        if (lastClickedRowIndex === null) {
            return { type: 'toggle', id }
        }
        const [start, end] = [lastClickedRowIndex, rowIndex].sort(
            (a, b) => a - b
        )
        const ids = rows
            .slice(start, end + 1)
            .map(getRowId)
            .filter(Boolean)
        return { type: 'range', ids }
    }

    if (event.ctrlKey || event.metaKey) {
        return { type: 'toggle', id }
    }

    return null
}

const DataTableWithVirtuosoContext = ({ context, ...props }) => (
    <DataTable
        {...props}
        layout={context.layout}
        className={styles.dataTable}
    />
)

DataTableWithVirtuosoContext.propTypes = {
    context: PropTypes.shape({
        layout: PropTypes.string,
    }),
}

const DataTableRowWithVirtuosoContext = ({ context, item, ...props }) => (
    <DataTableRow
        onMouseEnter={() => context.onMouseEnter(item)}
        onMouseLeave={context.onMouseLeave}
        onContextMenu={(e) => context.onContextMenu(e, item)}
        onClick={(e) => context.onRowClick(item, e)}
        onDoubleClick={() => context.onRowDoubleClick(item)}
        {...props}
    />
)

DataTableRowWithVirtuosoContext.propTypes = {
    context: PropTypes.shape({
        onContextMenu: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onRowClick: PropTypes.func,
        onRowDoubleClick: PropTypes.func,
    }),
    item: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string,
            itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        })
    ),
}

const TableComponents = {
    Table: DataTableWithVirtuosoContext,
    TableBody: DataTableBody,
    TableHead: DataTableHead,
    TableRow: DataTableRowWithVirtuosoContext,
    EmptyPlaceholder: () => (
        <tr>
            <td colSpan={99999}>
                <div className={styles.noResults}>
                    {i18n.t('No results found')}
                </div>
            </td>
        </tr>
    ),
}

const Table = ({ availableWidth, onCountChange, showOnlySelected }) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const headerRowRef = useRef(null)
    const virtuosoRef = useRef(null)
    const [columnWidths, setColumnWidths] = useState([])
    const minColumnWidthsRef = useRef([])
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const selection = useSelector((state) => state.selection)
    const showOnlyFeaturesInView = useSelector(
        (state) => state.ui.showOnlyFeaturesInView
    )
    const mapBounds = useSelector((state) => state.ui.mapBounds)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: 'name',
            sortDirection: ASCENDING,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)

    const sortData = useCallback(
        ({ name }) => {
            setSorting({
                sortField: name,
                sortDirection:
                    name === sortField && sortDirection === ASCENDING
                        ? DESCENDING
                        : ASCENDING,
            })
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

    const { headers, rows, isLoading, error, totalCount, filteredCount } =
        useTableData({
            layer,
            sortField,
            sortDirection,
            showOnlyFeaturesInView,
            mapBounds,
            showOnlySelected,
            selectedIdSet,
        })

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

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            onContextMenu: onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
        }),
        [
            setFeatureHighlight,
            clearFeatureHighlight,
            onRowContextMenu,
            onRowClick,
            onRowDoubleClick,
            columnWidths,
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
    const allRowIdSet = useMemo(() => new Set(allRowIds), [allRowIds])

    const isAllSelected = useMemo(
        () =>
            allRowIds.length > 0 &&
            allRowIds.every((id) => selectedIdSet.has(id)),
        [allRowIds, selectedIdSet]
    )

    const onToggleSelectAll = useCallback(() => {
        const nextIds = isAllSelected
            ? selectedIds.filter((id) => !allRowIdSet.has(id))
            : [...new Set([...selectedIds, ...allRowIds])]

        if (nextIds.length) {
            dispatch(selectAllFeatures(nextIds, layer.id))
        } else {
            dispatch(clearSelection())
        }
    }, [dispatch, isAllSelected, allRowIds, allRowIdSet, selectedIds, layer.id])

    useEffect(() => {
        // Measure column widths in auto layout, then switch to fixed to prevent content shift during virtual scrolling
        if (columnWidths.length === 0 && headerRowRef.current) {
            const frameId = requestAnimationFrame(() => {
                if (!headerRowRef.current) {
                    return
                }

                const measuredColumnWidths = []

                const dataCells = Array.from(headerRowRef.current.cells).slice(
                    1
                )

                for (const cell of dataCells) {
                    const rect = cell.getBoundingClientRect()
                    measuredColumnWidths.push(Math.floor(rect.width))
                }

                minColumnWidthsRef.current = measuredColumnWidths
                setColumnWidths(measuredColumnWidths)
            })

            return () => cancelAnimationFrame(frameId)
        }
    }, [columnWidths])

    useEffect(() => {
        // Reset to auto layout for re-measurement when headers change
        if (!error) {
            minColumnWidthsRef.current = []
            setColumnWidths([])
        }
    }, [headers, error])

    useEffect(() => {
        // Scale column widths proportionally on resize, clamped to initial measured widths
        if (!error) {
            setColumnWidths((prev) => {
                if (prev.length === 0) {
                    return prev
                }
                const prevTotal = prev.reduce((sum, w) => sum + w, 0)
                if (prevTotal === 0 || availableWidth === 0) {
                    return []
                }
                const minWidths = minColumnWidthsRef.current
                return prev.map((w, i) =>
                    Math.max(
                        minWidths[i] ?? 0,
                        Math.round((w / prevTotal) * availableWidth)
                    )
                )
            })
        }
    }, [availableWidth, error])

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
                fixedHeaderContent={() => (
                    <DataTableRow ref={headerRowRef}>
                        <DataTableColumnHeader
                            className={styles.checkboxCell}
                            width="32px"
                        >
                            <input
                                type="checkbox"
                                title={i18n.t('Select all')}
                                checked={isAllSelected}
                                onChange={onToggleSelectAll}
                            />
                        </DataTableColumnHeader>
                        {headers.map(({ name, dataKey, type }, index) => (
                            <DataTableColumnHeader
                                className={styles.columnHeader}
                                key={`${dataKey}-${index}`}
                                onFilterIconClick={type && Function.prototype}
                                showFilter={!!type && dataKey !== 'index'}
                                name={dataKey}
                                filter={
                                    type && (
                                        <FilterInput
                                            type={type}
                                            dataKey={dataKey}
                                            name={name}
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
                                    <Tooltip
                                        content={i18n.t('Sort by {{column}}', {
                                            column: name,
                                        })}
                                    >
                                        <button
                                            type="button"
                                            className={styles.sortButton}
                                            data-test={`data-table-column-sort-button-${name}`}
                                            onClick={() =>
                                                sortData({ name: dataKey })
                                            }
                                        >
                                            <SortIcon
                                                direction={
                                                    dataKey === sortField
                                                        ? sortDirection
                                                        : null
                                                }
                                            />
                                        </button>
                                    </Tooltip>
                                </span>
                            </DataTableColumnHeader>
                        ))}
                    </DataTableRow>
                )}
                itemContent={(_, row) => {
                    const rowId = getRowId(row)
                    const isSelected = !!rowId && selectedIdSet.has(rowId)
                    const isHovered =
                        !!rowId &&
                        feature?.id === rowId &&
                        feature?.layerId === layer.id

                    return (
                        <>
                            <DataTableCell
                                staticStyle
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
                            {row.map(({ dataKey, value, align }) => (
                                <DataTableCell
                                    key={`dtcell-${dataKey}`}
                                    staticStyle
                                    className={cx(styles.dataCell, {
                                        [styles.lightText]:
                                            dataKey === 'color' &&
                                            isDarkColor(value),
                                        [styles.selected]: isSelected,
                                        [styles.hovered]: isHovered,
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
                            ))}
                        </>
                    )
                }}
            />
            {(isLoading || layer?.isLoaded === false || layer?.isLoading) && (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
            )}
            <TableContextMenu
                contextMenu={tableContextMenu}
                layer={layer}
                selectedIds={selectedIds}
                onClose={() => setTableContextMenu(null)}
            />
        </>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
    showOnlySelected: PropTypes.bool,
    onCountChange: PropTypes.func,
}

export default Table
