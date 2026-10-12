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
import { highlightFeature, setFeatureProfile } from '../../actions/feature.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { EVENT_LAYER, GEOJSON_URL_LAYER } from '../../constants/layers.js'
import { isDarkColor } from '../../util/colors.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import ColumnsModal from './ColumnsModal.jsx'
import ActiveFiltersBar from './filters/ActiveFiltersBar.jsx'
import HeaderFilter from './filters/HeaderFilter.jsx'
import styles from './styles/DataTable.module.css'
import { useTableData } from './useTableData.js'

const DEFAULT = 'default'

// Decides whether a row's highlight should be cleared on mouse leave.
// When hovering to the next row the next element is a `TD`, in which case
// `setFeatureHighlight` fires and the highlight does not need to be cleared.
// When leaving to no element (e.g. the cursor exits the browser window)
// `relatedTarget` is null, so the optional chaining guards against a crash.
// Exported for testing.
export const shouldClearFeatureHighlight = (event) =>
    event.relatedTarget?.tagName !== 'TD'

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
        onClick={() => context.onClick(item)}
        onMouseEnter={() => context.onMouseEnter(item)}
        onMouseLeave={context.onMouseLeave}
        {...props}
    />
)

DataTableRowWithVirtuosoContext.propTypes = {
    context: PropTypes.shape({
        onClick: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
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

const Table = ({
    availableWidth,
    visibleColumns,
    showColumnsModal,
    onColumnsModalClose,
    onColumnsChange,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const headerRowRef = useRef(null)
    const [columnWidths, setColumnWidths] = useState([])
    const minColumnWidthsRef = useRef([])
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)

    const dispatch = useDispatch()
    const feature = useSelector((state) => state.feature)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: null,
            sortDirection: DEFAULT,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)

    // 3-state sort: default (layer order) -> ascending -> descending
    const sortData = useCallback(({ name, direction }) => {
        setSorting(
            direction === DEFAULT
                ? { sortField: null, sortDirection: DEFAULT }
                : { sortField: name, sortDirection: direction }
        )
    }, [])

    const showDetailView = useCallback(
        (row) => {
            if (layer.layer === EVENT_LAYER) {
                return
            }

            if (layer.layer === GEOJSON_URL_LAYER) {
                const { name } = layer

                const data = row.reduce((acc, { dataKey, value }) => {
                    acc[dataKey] = value
                    return acc
                }, {})

                dispatch(
                    setFeatureProfile({
                        name,
                        data,
                    })
                )
            } else {
                const id = row.find((r) => r.dataKey === 'id')?.value
                id && dispatch(setOrgUnitProfile(id))
            }
        },
        [dispatch, layer]
    )

    const setFeatureHighlight = useCallback(
        (row) => {
            const id =
                row.find((r) => r.dataKey === 'id')?.value || row[0].itemId

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

    const tableContext = useMemo(
        () => ({
            onClick: showDetailView,
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
        }),
        [
            showDetailView,
            setFeatureHighlight,
            clearFeatureHighlight,
            columnWidths,
        ]
    )

    const { headers, allHeaders, data, totalCount, rows, isLoading, error } =
        useTableData({
            layer,
            sortField,
            sortDirection,
            visibleColumns,
        })

    useEffect(() => {
        // Measure column widths in auto layout, then switch to fixed to prevent content shift during virtual scrolling
        if (columnWidths.length === 0 && headerRowRef.current) {
            requestAnimationFrame(() => {
                const measuredColumnWidths = []

                for (const cell of headerRowRef.current.cells) {
                    const rect = cell.getBoundingClientRect()
                    measuredColumnWidths.push(Math.floor(rect.width))
                }

                minColumnWidthsRef.current = measuredColumnWidths
                setColumnWidths(measuredColumnWidths)
            })
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
        <div className={styles.tableWrapper}>
            <ActiveFiltersBar
                layerId={layer.id}
                filters={layer.dataFilters}
                headers={allHeaders}
                rowCount={rows?.length ?? 0}
                totalCount={totalCount}
            />
            <TableVirtuoso
                context={tableContext}
                components={TableComponents}
                style={{
                    flex: 1,
                    width: '100%',
                }}
                data={rows}
                fixedHeaderContent={() => (
                    <DataTableRow ref={headerRowRef}>
                        {headers.map((header, index) => {
                            const { name, dataKey } = header
                            return (
                                <DataTableColumnHeader
                                    className={styles.columnHeader}
                                    key={`${dataKey}-${index}`}
                                    onSortIconClick={sortData}
                                    sortDirection={
                                        dataKey === sortField
                                            ? sortDirection
                                            : DEFAULT
                                    }
                                    sortIconTitle={i18n.t(
                                        'Sort by {{column}}',
                                        {
                                            column: name,
                                        }
                                    )}
                                    name={dataKey}
                                    width={
                                        columnWidths.length > 0
                                            ? `${columnWidths[index]}px`
                                            : 'auto'
                                    }
                                >
                                    <span className={styles.headerContent}>
                                        <span>{name}</span>
                                        <HeaderFilter
                                            layerId={layer.id}
                                            header={header}
                                            filter={
                                                layer.dataFilters?.[dataKey]
                                            }
                                            data={data}
                                        />
                                    </span>
                                </DataTableColumnHeader>
                            )
                        })}
                    </DataTableRow>
                )}
                itemContent={(_, row) =>
                    row.map(({ dataKey, value, align, mono, swatch }) => (
                        <DataTableCell
                            key={`dtcell-${dataKey}`}
                            className={cx(styles.dataCell, {
                                [styles.mono]: mono,
                                [styles.lightText]:
                                    dataKey === 'color' && isDarkColor(value),
                            })}
                            backgroundColor={dataKey === 'color' ? value : null}
                            align={align}
                        >
                            {swatch && value && (
                                <span
                                    className={styles.swatch}
                                    style={{ backgroundColor: swatch }}
                                />
                            )}
                            {dataKey === 'color'
                                ? value?.toLowerCase()
                                : mono
                                ? value
                                : formatWithSeparator(
                                      value,
                                      keyAnalysisDigitGroupSeparator
                                  )}
                        </DataTableCell>
                    ))
                }
            />
            {showColumnsModal && allHeaders && (
                <ColumnsModal
                    layerName={layer.name}
                    allHeaders={allHeaders}
                    selected={headers.map((h) => h.dataKey)}
                    onApply={onColumnsChange}
                    onClose={onColumnsModalClose}
                />
            )}
            {isLoading && (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
            )}
        </div>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
    showColumnsModal: PropTypes.bool,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    onColumnsChange: PropTypes.func,
    onColumnsModalClose: PropTypes.func,
}

export default Table
