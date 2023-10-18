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
// import propTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import styles from './styles/UiDataTable.module.css'

const Table = () => {
    const map = useSelector((state) => state.map)
    const dataTable = useSelector((state) => state.dataTable)
    // const allAggregations = useSelector((state) => state.aggregations)
    // const feature = useSelector((state) => state.feature)

    const layer = map.mapViews.find((l) => l.id === dataTable)

    if (!layer) {
        return <span>No data</span>
    }

    // const aggregations = allAggregations[layer?.id]

    const { data } = layer

    console.log('jj data', data)

    const thematicHeaders = [
        i18n.t('Index'),
        i18n.t('Name'),
        i18n.t('Id'),
        i18n.t('Value'),
        i18n.t('Legend'),
        i18n.t('Range'),
        i18n.t('Level'),
        i18n.t('Parent'),
        i18n.t('Type'),
        i18n.t('Color'),
        i18n.t('Name2'),
        i18n.t('Id2'),
        i18n.t('Value2'),
        i18n.t('Legend2'),
        i18n.t('Range2'),
        i18n.t('Level2'),
        i18n.t('Parent2'),
        i18n.t('Type2'),
        i18n.t('Color2'),
    ]

    const rows = data.map((row, index) => {
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

    return (
        <DataTable scrollHeight={'100%'} scrollWidth={'100%'} width={'100%'}>
            <DataTableHead>
                <DataTableRow>
                    {thematicHeaders.map((header, index) => (
                        <DataTableColumnHeader
                            fixed
                            top="0"
                            key={`${header}-${index}`}
                            name={header}
                        >
                            {header}
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
