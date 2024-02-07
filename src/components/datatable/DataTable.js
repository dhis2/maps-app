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
import { highlightFeature } from '../../actions/feature.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { EVENT_LAYER } from '../../constants/layers.js'
import { isDarkColor } from '../../util/colors.js'
import FilterInput from './FilterInput.js'
import styles from './styles/DataTable.module.css'
import { useTableData } from './useTableData.js'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

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

const Table = ({ availableHeight, availableWidth }) => {
    const headerRowRef = useRef(null)
    const [columnWidths, setColumnWidths] = useState([])
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

    const showOrgUnitProfile = useCallback(
        (row) => {
            const id = row.find((r) => r.dataKey === 'id')?.value
            id && dispatch(setOrgUnitProfile(id))
        },
        [dispatch]
    )

    const setFeatureHighlight = useCallback(
        (row) => {
            const id = row.find((r) => r.dataKey === 'id')?.value
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
            const nextElement = event.toElement ?? event.relatedTarget
            // When hovering to the next row the next element is a `TD`
            // If this is the case `setFeatureHighlight` will
            // fire and the highlight does not need to be cleared
            if (nextElement.tagName !== 'TD') {
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const tableContext = useMemo(
        () => ({
            onClick:
                layer.layer !== EVENT_LAYER
                    ? showOrgUnitProfile
                    : Function.prototype,
            onMouseEnter: setFeatureHighlight,
            onMouseLeave: clearFeatureHighlight,
            layout: columnWidths.length > 0 ? 'fixed' : 'auto',
        }),
        [
            layer.layer,
            showOrgUnitProfile,
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
        /* The combination of automtic table layout and virtual scrolling
         * causes a content shift when scrolling and filtering because the
         * cells in the DOM have a different content length which causes the
         * columns to have a different width. To avoid that we measure the
         * initial column widths and switch to a fixed layout based on these
         * measured widths */
        if (columnWidths.length === 0) {
            const measuredColumnWidths = []

            for (const cell of headerRowRef.current.cells) {
                measuredColumnWidths.push(cell.offsetWidth)
            }
            setColumnWidths(measuredColumnWidths)
        }
    }, [columnWidths])

    useEffect(() => {
        /* When the window is resized or the sidebar opens
         * the table needs to switch back to its automatic layout
         * so that the cells can subsequently can be measured again
         * in the useEffect hook above */
        setColumnWidths([])
    }, [availableWidth])

    if (error) {
        return <div className={styles.noSupport}>{error}</div>
    }

    if (!headers.length) {
        return (
            <div className={styles.noSupport}>
                {i18n.t('Data table is not supported for this layer.')}
            </div>
        )
    }

    if (layer.serverCluster) {
        return (
            <div className={styles.noSupport}>
                {i18n.t(
                    'Data table is not supported when events are grouped on the server.'
                )}
            </div>
        )
    }

    return (
        <>
            <TableVirtuoso
                context={tableContext}
                components={TableComponents}
                style={{
                    height: availableHeight,
                    width: '100%',
                }}
                data={rows}
                fixedHeaderContent={() => (
                    <tr ref={headerRowRef}>
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
                                        />
                                    )
                                }
                                width={
                                    columnWidths.length > 0
                                        ? `columnWidths[index]px`
                                        : 'auto'
                                }
                            >
                                {name}
                            </DataTableColumnHeader>
                        ))}
                    </tr>
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
                            {dataKey === 'color' ? value?.toLowerCase() : value}
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
    availableHeight: PropTypes.number,
    availableWidth: PropTypes.number,
}

export default Table
