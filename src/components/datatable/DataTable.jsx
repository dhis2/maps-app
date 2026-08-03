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
import FilterInput from './FilterInput.jsx'
import styles from './styles/DataTable.module.css'
import { useTableData } from './useTableData.js'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

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

const Table = ({ availableWidth }) => {
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
                    sortDirection === ASCENDING ? DESCENDING : ASCENDING,
            })
        },
        [sortDirection]
    )

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

    const { headers, rows, isLoading, error } = useTableData({
        layer,
        sortField,
        sortDirection,
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
        <>
            <TableVirtuoso
                context={tableContext}
                components={TableComponents}
                style={{
                    height: '100%',
                    width: '100%',
                }}
                data={rows}
                fixedHeaderContent={() => (
                    <DataTableRow ref={headerRowRef}>
                        {headers.map(({ name, dataKey, type }, index) => (
                            <DataTableColumnHeader
                                className={styles.columnHeader}
                                key={`${dataKey}-${index}`}
                                onSortIconClick={sortData}
                                sortDirection={
                                    dataKey === sortField
                                        ? sortDirection
                                        : 'default'
                                }
                                sortIconTitle={i18n.t('Sort by {{column}}', {
                                    column: name,
                                })}
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
                                {name}
                            </DataTableColumnHeader>
                        ))}
                    </DataTableRow>
                )}
                itemContent={(_, row) =>
                    row.map(({ dataKey, value, align }) => (
                        <DataTableCell
                            key={`dtcell-${dataKey}`}
                            className={cx(styles.dataCell, {
                                [styles.lightText]:
                                    dataKey === 'color' && isDarkColor(value),
                            })}
                            backgroundColor={dataKey === 'color' ? value : null}
                            align={align}
                        >
                            {dataKey === 'color'
                                ? value?.toLowerCase()
                                : formatWithSeparator(
                                      value,
                                      keyAnalysisDigitGroupSeparator
                                  )}
                        </DataTableCell>
                    ))
                }
            />
            {isLoading && (
                <ComponentCover>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </ComponentCover>
            )}
        </>
    )
}

Table.propTypes = {
    availableWidth: PropTypes.number,
}

export default Table
