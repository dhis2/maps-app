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
// import { debounce } from 'lodash/fp'
import React, { useEffect, useReducer, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataTable } from '../../actions/dataTable.js'
// import { highlightFeature } from '../../actions/feature.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import { isDarkColor } from '../../util/colors.js'
import { getHeaders } from '../../util/dataTable.js'
import { filterData } from '../../util/filter.js'
import styles from './styles/UiDataTable.module.css'
import FilterInput from './UiFilterInput.js'
// import { get } from 'lodash'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

const TYPE_NUMBER = 'number'
const EMPTY_AGGREGATIONS = {}

const Table = () => {
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)
    const allAggregations = useSelector((state) => state.aggregations)
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
    const aggregations = allAggregations[layer.id] || EMPTY_AGGREGATIONS

    const rows = useMemo(() => {
        if (!layer) {
            return []
        }

        const { data, dataFilters } = layer

        const indexedData = data
            .filter((d) => !d.properties.hasAdditionalGeometry)
            .map((d, i) => {
                const type = d.geometry?.type || d.properties?.type || d.type
                return {
                    ...(d.properties || d),
                    ...aggregations[d.id],
                    type,
                    index: i,
                    i,
                }
            })

        const filteredData = filterData(indexedData, dataFilters)

        //sort
        filteredData.sort((a, b) => {
            a = a[sortField]
            b = b[sortField]

            if (typeof a === TYPE_NUMBER) {
                return sortDirection === ASCENDING ? a - b : b - a
            }
            // TODO: Make sure sorting works across different locales - use lib method
            if (a !== undefined) {
                return sortDirection === ASCENDING
                    ? a.localeCompare(b)
                    : b.localeCompare(a)
            }

            return 0
        })

        const headers = getHeaders(layer)

        return filteredData.map((item) =>
            headers.map(({ dataKey }) => ({
                value: item[dataKey],
                dataKey,
            }))
        )
    }, [layer, aggregations, sortField, sortDirection])

    useEffect(() => {
        // TODO - improve and test
        if (rows !== null && !rows.length) {
            dispatch(closeDataTable())
        }
    }, [rows, dispatch])

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

    if (layer.serverCluster) {
        return (
            <div className={styles.noSupport}>
                {i18n.t(
                    'Data table is not supported when events are grouped on the server.'
                )}
            </div>
        )
    }

    const onTableRowClick = (row) => {
        const id = row.find((r) => r.dataKey === 'id')?.value
        id && dispatch(setOrgUnitProfile(id))
    }

    //TODO
    // Debounce needed as event is triggered multiple times for the same row
    // const highlightMapFeature = debounce(50, (id) => {
    //     if (!id || !feature || id !== feature.id) {
    //         dispatch(
    //             highlightFeature(
    //                 id
    //                     ? {
    //                           id,
    //                           layerId: layer.id,
    //                           origin: 'table',
    //                       }
    //                     : null
    //             )
    //         )
    //     }
    // })

    // TODO - need this implemented in ui
    const onRowMouseOver = (evt) => console.log('onMouseOver', evt.target.value)
    const onRowMouseOut = (evt) => console.log('onMouseOut', evt.target.value)
    const onRowClick = (evt) => console.log('onRowClick', evt.target.value)

    return (
        <DataTable
            scrollHeight="100%"
            scrollWidth="100%"
            width="auto"
            dataTest="data-table"
        >
            <DataTableHead>
                <DataTableRow>
                    {getHeaders(layer).map(({ name, dataKey, type }, index) => (
                        <DataTableColumnHeader
                            fixed
                            top="0"
                            className={styles.columnHeader}
                            key={`${dataKey}-${index}`}
                            dataKey={dataKey}
                            name={dataKey}
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
            </DataTableHead>
            <DataTableBody>
                {rows.map((row, index) => (
                    <DataTableRow
                        key={`dtrow-${index}`}
                        onClick={onRowClick}
                        onMouseOver={onRowMouseOver}
                        onMouseOut={onRowMouseOut}
                    >
                        {row.map(({ dataKey, value }) => (
                            <DataTableCell
                                dense
                                key={`dtcell-${dataKey}`}
                                className={cx(styles.tableCell, {
                                    [styles.darkText]:
                                        dataKey === 'color' &&
                                        isDarkColor(value),
                                })}
                                backgroundColor={
                                    dataKey === 'color' ? value : null
                                }
                                // onClick={() => onTableRowClick(row)}
                            >
                                {dataKey === 'color'
                                    ? value?.toLowerCase()
                                    : value}
                            </DataTableCell>
                        ))}
                    </DataTableRow>
                ))}
            </DataTableBody>
        </DataTable>
    )
}

export default Table
