import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableBody,
} from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useReducer, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TableVirtuoso } from 'react-virtuoso'
import { highlightFeature } from '../../actions/feature.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { isDarkColor } from '../../util/colors.js'
import FilterInput from './FilterInput.js'
import styles from './styles/UiDataTable.module.css'
import { useTableData } from './useTableData.js'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

const DataTableRowWithVirtuosoContext = ({ context, item, ...props }) => {
    return (
        <DataTableRow
            onClick={() => context.onClick(item)}
            onMouseEnter={() => context.onMouseEnter(item)}
            onMouseLeave={context.onMouseLeave}
            {...props}
        />
    )
}

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
    Table: DataTable,
    TableBody: DataTableBody,
    TableHead: DataTableHead,
    TableRow: DataTableRowWithVirtuosoContext,
}

const Table = ({ height }) => {
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

    const { headers, rows } = useTableData({ layer, sortField, sortDirection })

    const onTableRowClick = useCallback(
        (row) => {
            const id = row.find((r) => r.dataKey === 'id')?.value
            id && dispatch(setOrgUnitProfile(id))
        },
        [dispatch]
    )

    const highlightFeatureOnMouseEnter = useCallback(
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
    const clearFeatureHighlightOnMouseLeave = useCallback(
        (event) => {
            const nextElement = event.toElement ?? event.relatedTarget
            // When hovering to the next row the next element is a `TD`
            // If this is the case `highlightFeatureOnMouseEnter` will
            // fire and the highlight does not need to be cleared
            if (nextElement.tagName !== 'TD') {
                dispatch(highlightFeature(null))
            }
        },
        [dispatch]
    )

    const tableContext = useMemo(
        () => ({
            onClick: onTableRowClick,
            onMouseEnter: highlightFeatureOnMouseEnter,
            onMouseLeave: clearFeatureHighlightOnMouseLeave,
        }),
        [
            onTableRowClick,
            highlightFeatureOnMouseEnter,
            clearFeatureHighlightOnMouseLeave,
        ]
    )

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
        <TableVirtuoso
            context={tableContext}
            components={TableComponents}
            style={{ height, width: '100%' }}
            data={rows}
            fixedHeaderContent={() => (
                <DataTableRow>
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
                            showFilter={!!type}
                            name={dataKey}
                            filter={
                                type && (
                                    <FilterInput
                                        type={type}
                                        dataKey={dataKey}
                                    />
                                )
                            }
                        >
                            {name}
                        </DataTableColumnHeader>
                    ))}
                </DataTableRow>
            )}
            itemContent={(_, row) =>
                row.map(({ dataKey, value }) => (
                    <DataTableCell
                        key={`dtcell-${dataKey}`}
                        className={cx(styles.fontClass, styles.sizeClass, {
                            [styles.darkText]:
                                dataKey === 'color' && isDarkColor(value),
                        })}
                        backgroundColor={dataKey === 'color' ? value : null}
                    >
                        {dataKey === 'color' ? value?.toLowerCase() : value}
                    </DataTableCell>
                ))
            }
        />
    )
}

Table.propTypes = {
    height: PropTypes.number,
}

export default Table
