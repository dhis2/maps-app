import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableBody,
    DataTableHead,
    DataTableRow,
    DataTableColumnHeader,
    DataTableCell,
    Input,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react'
import { useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { highlightFeature } from '../../actions/feature.js'
import { setCrossLayerSelection } from '../../actions/selection.js'
import { SORT_ASCENDING } from '../../constants/dataTable.js'
import {
    getNextSorting,
    getRowClickAction,
    getRowId,
    isFilterable,
    shouldClearFeatureHighlight,
} from '../../util/dataTable.js'
import { SortIcon } from '../core/icons.jsx'
import styles from './styles/CombinedDataTable.module.css'
import dataTableStyles from './styles/DataTable.module.css'
import TopTooltip from './TopTooltip.jsx'
import { useCombinedTableData } from './useCombinedTableData.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const LARGE_FEATURE_THRESHOLD_LABEL = '10,000'
const EMPTY_FILTERS = {}

const mergeCrossLayerIds = (rowKeys, rowFeatureIds) => {
    const merged = {}
    rowKeys.forEach((key) => {
        const entry = rowFeatureIds.get(key)
        if (!entry) {
            return
        }
        Object.entries(entry).forEach(([layerId, ids]) => {
            merged[layerId] = [...new Set([...(merged[layerId] ?? []), ...ids])]
        })
    })
    return merged
}

const CombinedTable = (props) => (
    <DataTable {...props} className={styles.dataTable} />
)

const CombinedTableRow = React.memo(function CombinedTableRow({
    context,
    item,
    ...props
}) {
    return (
        <DataTableRow
            onMouseEnter={() => context.onMouseEnter(item)}
            onMouseLeave={context.onMouseLeave}
            onClick={(e) => context.onRowClick(item, e)}
            {...props}
        />
    )
})

CombinedTableRow.propTypes = {
    context: PropTypes.shape({
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onRowClick: PropTypes.func,
    }),
    item: PropTypes.array,
}

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
    Table: CombinedTable,
    TableBody: DataTableBody,
    TableHead: DataTableHead,
    TableRow: CombinedTableRow,
    EmptyPlaceholder,
}

const CombinedDataTable = ({
    availableWidth,
    layers,
    joinConfig,
    filters,
    onFiltersChange,
    globalSearch,
    onCountChange,
}) => {
    const dispatch = useDispatch()

    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        { sortField: 'name', sortDirection: SORT_ASCENDING }
    )

    const sortData = useCallback(
        ({ name }) => {
            setSorting(getNextSorting(name, { sortField, sortDirection }))
        },
        [sortField, sortDirection]
    )

    const { headers, rows, rowFeatureIds, spatialWarning } =
        useCombinedTableData({
            layers,
            joinConfig,
            sortField,
            sortDirection,
            filters,
            globalSearch,
        })

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
                applySelection([...new Set([...selectedIds, ...action.ids])])
            } else {
                applySelection(
                    selectedIds.includes(action.id)
                        ? selectedIds.filter((i) => i !== action.id)
                        : [...selectedIds, action.id]
                )
            }
            lastClickedRowIndexRef.current = rowIndex
        },
        [applySelection, selectedIds, rows]
    )

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

    const isAllSelected =
        allRowIds.length > 0 && allRowIds.every((id) => selectedIdSet.has(id))

    const onToggleSelectAll = useCallback(() => {
        applySelection(
            isAllSelected
                ? selectedIds.filter((id) => !allRowIds.includes(id))
                : [...new Set([...selectedIds, ...allRowIds])]
        )
    }, [applySelection, isAllSelected, selectedIds, allRowIds])

    const tableContext = useMemo(
        () => ({
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            onRowClick,
        }),
        [setFeatureHighlight, clearFeatureHighlight, onRowClick]
    )

    const onFilterChange = useCallback(
        (dataKey, value) => {
            const next = { ...(filters ?? EMPTY_FILTERS) }
            if (value) {
                next[dataKey] = value
            } else {
                delete next[dataKey]
            }
            onFiltersChange?.(next)
        },
        [filters, onFiltersChange]
    )

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow>
                <DataTableColumnHeader className={styles.checkboxCell}>
                    <TopTooltip content={i18n.t('Select all visible rows')}>
                        <input
                            type="checkbox"
                            aria-label={i18n.t('Select all visible rows')}
                            checked={isAllSelected}
                            onChange={onToggleSelectAll}
                        />
                    </TopTooltip>
                </DataTableColumnHeader>
                {headers.map(({ name, dataKey, type }) => (
                    <DataTableColumnHeader
                        key={dataKey}
                        name={dataKey}
                        onFilterIconClick={
                            isFilterable(dataKey, type) && Function.prototype
                        }
                        showFilter={isFilterable(dataKey, type)}
                        filter={
                            isFilterable(dataKey, type) && (
                                <Input
                                    dense
                                    clearable
                                    dataTest={`combined-table-column-filter-${name}`}
                                    placeholder={i18n.t('Search')}
                                    value={filters?.[dataKey] ?? ''}
                                    onChange={({ value }) =>
                                        onFilterChange(dataKey, value)
                                    }
                                />
                            )
                        }
                    >
                        <span className={dataTableStyles.headerContent}>
                            <span className={dataTableStyles.headerTitle}>
                                {name}
                            </span>
                            <TopTooltip
                                content={i18n.t('Sort by {{column}}', {
                                    column: name,
                                })}
                            >
                                <button
                                    type="button"
                                    className={dataTableStyles.sortButton}
                                    data-test={`combined-table-column-sort-button-${name}`}
                                    onClick={() => sortData({ name: dataKey })}
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
                ))}
            </DataTableRow>
        ),
        [
            headers,
            filters,
            onFilterChange,
            sortData,
            sortField,
            sortDirection,
            isAllSelected,
            onToggleSelectAll,
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
                                        applySelection(
                                            selectedIds.includes(rowId)
                                                ? selectedIds.filter(
                                                      (id) => id !== rowId
                                                  )
                                                : [...selectedIds, rowId]
                                        )
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </DataTableCell>
                            {row.map(({ dataKey, value, align }) => (
                                <DataTableCell
                                    key={dataKey}
                                    staticStyle
                                    align={align}
                                    className={cx({
                                        [styles.selected]: isSelected,
                                        [styles.hovered]: isHovered,
                                    })}
                                >
                                    {value ?? '—'}
                                </DataTableCell>
                            ))}
                        </>
                    )
                }}
            />
        </div>
    )
}

CombinedDataTable.propTypes = {
    joinConfig: PropTypes.shape({
        layerIds: PropTypes.arrayOf(PropTypes.string),
        level: PropTypes.string,
        pointLayerId: PropTypes.string,
        polygonLayerId: PropTypes.string,
    }).isRequired,
    layers: PropTypes.array.isRequired,
    availableWidth: PropTypes.number,
    filters: PropTypes.object,
    globalSearch: PropTypes.string,
    onCountChange: PropTypes.func,
    onFiltersChange: PropTypes.func,
}

export default CombinedDataTable
