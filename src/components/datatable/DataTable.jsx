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
    Popover,
    Popper,
    Portal,
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
    selectAllFeatures,
    selectFeatureRange,
    clearSelection,
} from '../../actions/selection.js'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../constants/selection.js'
import { isDarkColor } from '../../util/colors.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import Checkbox from '../core/Checkbox.jsx'
import { SortIcon } from '../core/icons.jsx'
import FilterInput from './FilterInput.jsx'
import styles from './styles/DataTable.module.css'
import TableContextMenu from './TableContextMenu.jsx'
import { useTableData, SELECTED_SORT_KEY } from './useTableData.js'

const SELECTION_FILTER_OPTIONS = [
    { value: SELECTION_FILTER_SELECTED, label: i18n.t('Selected') },
    { value: SELECTION_FILTER_NOT_SELECTED, label: i18n.t('Not selected') },
]

// Every filterable column dispatches its dataFilters value straight through
// to filterData against each layer's real feature properties (see
// ThematicLayer.jsx/EventLayer.jsx/etc.). Index is a synthetic row number
// computed only for table display (see useTableData.js), never present on
// the underlying feature data - filtering by it narrows the table but
// can't affect the map. Still shown: it's a useful table-only tool (e.g.
// narrowing to a row-number range) even though it doesn't reach the map.
export const isFilterable = (dataKey, type) => !!type

// Inverts selection scoped to the currently-filtered/visible rows only,
// mirroring how the "select all" checkbox already treats them (see
// onToggleSelectAll) - ids selected before a filter narrowed the rows stay
// selected (offViewSelected), only the visible portion actually flips.
export const getReversedSelection = (selectedIds, allRowIds) => {
    const selectedIdSet = new Set(selectedIds)
    const allRowIdSet = new Set(allRowIds)
    const offViewSelected = selectedIds.filter((id) => !allRowIdSet.has(id))
    const invertedVisible = allRowIds.filter((id) => !selectedIdSet.has(id))
    return [...offViewSelected, ...invertedVisible]
}

const SelectionFilterButton = ({ value, onChange }) => {
    const anchorRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const toggleValue = (optionValue) => {
        const next = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue]
        onChange(next)
    }

    const buttonLabel =
        value.length === 0
            ? i18n.t('All')
            : i18n.t('{{count}} selected', { count: value.length })

    return (
        <>
            <button
                type="button"
                ref={anchorRef}
                className={styles.selectionFilterButton}
                data-test="data-table-selection-filter-button"
                onClick={() => setIsOpen((o) => !o)}
            >
                {buttonLabel}
            </button>
            {isOpen && (
                <Popover
                    reference={anchorRef}
                    placement="bottom-start"
                    arrow={false}
                    onClickOutside={() => setIsOpen(false)}
                >
                    <div className={styles.selectionFilterPopover}>
                        {SELECTION_FILTER_OPTIONS.map((option) => (
                            <Checkbox
                                key={option.value}
                                label={option.label}
                                checked={value.includes(option.value)}
                                onChange={() => toggleValue(option.value)}
                                style={{ margin: '4px 0' }}
                            />
                        ))}
                    </div>
                </Popover>
            )}
        </>
    )
}

SelectionFilterButton.propTypes = {
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
}

const topTooltipModifiers = [{ name: 'offset', options: { offset: [0, 4] } }]

// @dhis2/ui's Tooltip always includes a flip modifier that checks the
// nearest scrolling ancestor's clip box for room. The table header is
// position:sticky, pinned to the top of that scrolling container, so the
// flip modifier always reports "no room above" and flips the tooltip below
// the icon - even though there's plenty of room on screen. This variant
// skips the flip modifier so sort-icon tooltips stay pinned above the icon.
const TopTooltip = ({ content, children }) => {
    const [open, setOpen] = useState(false)
    const referenceRef = useRef(null)
    const openTimerRef = useRef(null)
    const closeTimerRef = useRef(null)

    const onOpen = () => {
        clearTimeout(closeTimerRef.current)
        openTimerRef.current = setTimeout(() => setOpen(true), 200)
    }

    const onClose = () => {
        clearTimeout(openTimerRef.current)
        closeTimerRef.current = setTimeout(() => setOpen(false), 200)
    }

    useEffect(
        () => () => {
            clearTimeout(openTimerRef.current)
            clearTimeout(closeTimerRef.current)
        },
        []
    )

    return (
        <span
            ref={referenceRef}
            onMouseOver={onOpen}
            onMouseOut={onClose}
            onFocus={onOpen}
            onBlur={onClose}
        >
            {children}
            {open && (
                <Portal>
                    <Popper
                        placement="top"
                        reference={referenceRef}
                        modifiers={topTooltipModifiers}
                    >
                        <div className={styles.topTooltipContent}>
                            {content}
                        </div>
                    </Popper>
                </Portal>
            )}
        </span>
    )
}

TopTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.node.isRequired,
}

const ASCENDING = 'asc'
const DESCENDING = 'desc'

export const shouldClearFeatureHighlight = (event) =>
    event.relatedTarget?.tagName !== 'TD'

// Cycles a column through ascending -> descending -> none (natural order) ->
// ascending... Once sortField is null, every column looks "unsorted" again,
// so clicking any of them (including the one that was just cleared)
// naturally restarts the cycle at ascending.
export const getNextSorting = (name, { sortField, sortDirection }) => {
    if (name !== sortField) {
        return { sortField: name, sortDirection: ASCENDING }
    }
    if (sortDirection === ASCENDING) {
        return { sortField: name, sortDirection: DESCENDING }
    }
    return { sortField: null, sortDirection: ASCENDING }
}

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

// Thematic layers merge their legend name + color into one swatch+name
// cell (see hasLegendColorPair); every other column is either the raw
// color's own cell (lowercased hex) or a plain formatted value.
const getCellContent = ({
    isLegendCell,
    swatchColor,
    value,
    dataKey,
    keyAnalysisDigitGroupSeparator,
}) => {
    if (isLegendCell) {
        return (
            <span className={styles.legendCell}>
                {swatchColor && (
                    <span
                        className={styles.legendSwatch}
                        style={{ backgroundColor: swatchColor }}
                    />
                )}
                {value}
            </span>
        )
    }
    if (dataKey === 'color') {
        return value?.toLowerCase()
    }
    return formatWithSeparator(value, keyAnalysisDigitGroupSeparator)
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

const EmptyPlaceholder = ({ context }) => (
    <tr>
        <td colSpan={99999}>
            <div className={styles.noResults}>
                {context.totalCount > 0 ? (
                    <>
                        {i18n.t('No features match your filters')}
                        {context.hasActiveFilters && (
                            <button
                                type="button"
                                className={styles.clearFiltersLink}
                                onClick={context.onClearFilters}
                            >
                                {i18n.t('Clear filters')}
                            </button>
                        )}
                    </>
                ) : (
                    i18n.t('No results found')
                )}
            </div>
        </td>
    </tr>
)

EmptyPlaceholder.propTypes = {
    context: PropTypes.shape({
        hasActiveFilters: PropTypes.bool,
        totalCount: PropTypes.number,
        onClearFilters: PropTypes.func,
    }),
}

const TableComponents = {
    Table: DataTableWithVirtuosoContext,
    TableBody: DataTableBody,
    TableHead: DataTableHead,
    TableRow: DataTableRowWithVirtuosoContext,
    EmptyPlaceholder,
}

const Table = ({
    availableWidth,
    onCountChange,
    globalSearch,
    onClearFilters,
}) => {
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
    const selectionFilter = useSelector((state) => state.ui.selectionFilter)
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

    const onReverseSelection = useCallback(() => {
        const nextIds = getReversedSelection(selectedIds, allRowIds)

        if (nextIds.length) {
            dispatch(selectAllFeatures(nextIds, layer.id))
        } else {
            dispatch(clearSelection())
        }
    }, [dispatch, selectedIds, allRowIds, layer.id])

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

    // Thematic layers carry both a `legend` (name) and `color` (hex) column;
    // merge them into one swatch+name cell instead of two separate columns.
    const hasLegendColorPair =
        headers.some((h) => h.dataKey === 'legend') &&
        headers.some((h) => h.dataKey === 'color')
    const visibleHeaders = hasLegendColorPair
        ? headers.filter((h) => h.dataKey !== 'color')
        : headers

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
                                <input
                                    type="checkbox"
                                    title={i18n.t('Select all')}
                                    checked={isAllSelected}
                                    onChange={onToggleSelectAll}
                                />
                                <TopTooltip
                                    content={i18n.t('Reverse selection')}
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
                                                name: SELECTED_SORT_KEY,
                                            })
                                        }
                                    >
                                        <SortIcon
                                            direction={
                                                sortField === SELECTED_SORT_KEY
                                                    ? sortDirection
                                                    : null
                                            }
                                        />
                                    </button>
                                </TopTooltip>
                            </div>
                        </DataTableColumnHeader>
                        {visibleHeaders.map(
                            ({ name, dataKey, type, optionSet }, index) => (
                                <DataTableColumnHeader
                                    className={styles.columnHeader}
                                    key={`${dataKey}-${index}`}
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
                                                options={columnOptions[dataKey]}
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
                                                className={styles.sortButton}
                                                data-test={`data-table-column-sort-button-${name}`}
                                                onClick={() =>
                                                    sortData({
                                                        name: dataKey,
                                                    })
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
                                        </TopTooltip>
                                    </span>
                                </DataTableColumnHeader>
                            )
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
                            {row
                                .filter(
                                    ({ dataKey }) =>
                                        !hasLegendColorPair ||
                                        dataKey !== 'color'
                                )
                                .map(({ dataKey, value, align }) => {
                                    const isLegendCell =
                                        hasLegendColorPair &&
                                        dataKey === 'legend'
                                    const swatchColor = isLegendCell
                                        ? row.find((c) => c.dataKey === 'color')
                                              ?.value
                                        : null

                                    return (
                                        <DataTableCell
                                            key={`dtcell-${dataKey}`}
                                            staticStyle
                                            className={cx(styles.dataCell, {
                                                [styles.lightText]:
                                                    !hasLegendColorPair &&
                                                    dataKey === 'color' &&
                                                    isDarkColor(value),
                                                [styles.monoCell]:
                                                    dataKey === 'id',
                                                [styles.selected]: isSelected,
                                                [styles.hovered]: isHovered,
                                            })}
                                            backgroundColor={
                                                !hasLegendColorPair &&
                                                dataKey === 'color'
                                                    ? value
                                                    : null
                                            }
                                            align={align}
                                        >
                                            {getCellContent({
                                                isLegendCell,
                                                swatchColor,
                                                value,
                                                dataKey,
                                                keyAnalysisDigitGroupSeparator,
                                            })}
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
}

export default Table
