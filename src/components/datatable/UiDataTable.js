import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableBody,
    // DataTableFoot,
    // Pagination,
    // Tooltip,
} from '@dhis2/ui'
import cx from 'classnames'
import React, { useState, useEffect, useReducer, useCallback } from 'react'
import { useSelector } from 'react-redux'
import styles from './styles/UiDataTable.module.css'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

const thematicHeaders = [
    { name: i18n.t('Index'), dataKey: 'index' },
    { name: i18n.t('Name'), dataKey: 'name' },
    { name: i18n.t('Id'), dataKey: 'id' },
    { name: i18n.t('Value'), dataKey: 'value' },
    { name: i18n.t('Legend'), dataKey: 'legend' },
    { name: i18n.t('Range'), dataKey: 'range' },
    { name: i18n.t('Level'), dataKey: 'level' },
    { name: i18n.t('Parent'), dataKey: 'parentName' },
    { name: i18n.t('Type'), dataKey: 'type' },
    { name: i18n.t('Color'), dataKey: 'color' },
    { name: i18n.t('Name2'), dataKey: 'name2' },
    { name: i18n.t('Id2'), dataKey: 'id2' },
    { name: i18n.t('Value2'), dataKey: 'value2' },
    { name: i18n.t('Legend2'), dataKey: 'legend2' },
    { name: i18n.t('Range2'), dataKey: 'range2' },
    { name: i18n.t('Level2'), dataKey: 'level2' },
    { name: i18n.t('Parent2'), dataKey: 'parentName2' },
    { name: i18n.t('Type2'), dataKey: 'type2' },
    { name: i18n.t('Color2'), dataKey: 'color2' },
]

const Table = () => {
    const { mapViews } = useSelector((state) => state.map)
    const activeLayerId = useSelector((state) => state.dataTable)
    // const allAggregations = useSelector((state) => state.aggregations)
    // const feature = useSelector((state) => state.feature)
    const [{ sortField, sortDirection }, setSorting] = useReducer(
        (sorting, newSorting) => ({ ...sorting, ...newSorting }),
        {
            sortField: 'name',
            sortDirection: ASCENDING,
        }
    )

    const layer = mapViews.find((l) => l.id === activeLayerId)
    const { data } = layer
    const [rows, setRows] = useState([])

    useEffect(() => {
        // update the sorting

        if (!data) {
            return
        }

        data.sort((a, b) => {
            a = a.properties[sortField]
            b = b.properties[sortField]

            if (typeof a === 'number') {
                return sortDirection === ASCENDING ? a - b : b - a
            }

            if (a !== undefined) {
                return sortDirection === ASCENDING
                    ? a.localeCompare(b)
                    : b.localeCompare(a)
            }

            return 0
        })

        setRows(
            data.map((row, index) => {
                return [
                    index,
                    row.properties.name,
                    row.properties.id,
                    row.properties.value,
                    row.properties.legend,
                    row.properties.range,
                    row.properties.level,
                    row.properties.parentName,
                    row.properties.type,
                    row.properties.color,
                    row.properties.name,
                    row.properties.id,
                    row.properties.value,
                    row.properties.legend,
                    row.properties.range,
                    row.properties.level,
                    row.properties.parentName,
                    row.properties.type,
                    row.properties.color,
                ]
            })
        )
    }, [data, sortField, sortDirection])

    // const aggregations = allAggregations[layer.id]

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

    // console.log('jj render table with sorting', sortField, sortDirection)

    return (
        <DataTable scrollHeight={'100%'} scrollWidth={'100%'} width={'100%'}>
            <DataTableHead>
                <DataTableRow>
                    {thematicHeaders.map(({ name, dataKey }, index) => (
                        <DataTableColumnHeader
                            fixed
                            top="0"
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
                        >
                            {name}
                        </DataTableColumnHeader>
                    ))}
                </DataTableRow>
            </DataTableHead>
            <DataTableBody>
                {rows.map((row, index) => (
                    <DataTableRow key={`dtrow-${index}`}>
                        {row.map((value, cellindex) => (
                            <DataTableCell
                                key={`dtcell-${cellindex}`}
                                className={cx(
                                    styles.cell,
                                    styles.fontClass,
                                    styles.sizeClass
                                )}
                            >
                                {value}
                            </DataTableCell>
                        ))}
                    </DataTableRow>
                ))}
            </DataTableBody>
        </DataTable>
    )
}

export default Table
