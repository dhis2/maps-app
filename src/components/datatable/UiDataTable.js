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
import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useMemo,
} from 'react'
import { useSelector } from 'react-redux'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    // EARTH_ENGINE_LAYER,
} from '../../constants/layers.js'
import { isDarkColor } from '../../util/colors.js'
import styles from './styles/UiDataTable.module.css'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

const getThematicHeaders = () => [
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
    // { name: i18n.t('Name2'), dataKey: 'name2' },
    // { name: i18n.t('Id2'), dataKey: 'id2' },
    // { name: i18n.t('Value2'), dataKey: 'value2' },
    // { name: i18n.t('Legend2'), dataKey: 'legend2' },
    // { name: i18n.t('Range2'), dataKey: 'range2' },
    // { name: i18n.t('Level2'), dataKey: 'level2' },
    // { name: i18n.t('Parent2'), dataKey: 'parentName2' },
    // { name: i18n.t('Type2'), dataKey: 'type2' },
    // { name: i18n.t('Color2'), dataKey: 'color2' },
]

const thematicFields = [
    'index',
    'name',
    'id',
    'value',
    'legend',
    'range',
    'level',
    'parentName',
    'type',
    'color',
]

const getEventHeaders = (layer) => {
    return [
        { name: i18n.t('Index'), dataKey: 'index' },
        { name: i18n.t('Org unit'), dataKey: 'ouname' },
        { name: i18n.t('Id'), dataKey: 'id' },
        { name: i18n.t('Event time'), dataKey: 'eventdate' },
        { name: i18n.t('Type'), dataKey: 'type' },
        // { name: i18n.t('Color'), dataKey: 'color' },
    ]
}

const getOrgUnitHeaders = () => [
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

    const getHeaders = () => {
        if (layer.layer === THEMATIC_LAYER) {
            return getThematicHeaders()
        } else if (layer.layer === EVENT_LAYER) {
            return getEventHeaders(layer)
        } else if (layer.layer === ORG_UNIT_LAYER) {
            return getOrgUnitHeaders(layer)
        }
        //  else if (layer.layer === EARTH_ENGINE_LAYER) {
        // }
    }

    const rawData = useMemo(
        () =>
            data &&
            data.map((d, index) => {
                return Object.assign({ index, ...d.properties })
            }),
        [data]
    )
    const [rows, setRows] = useState([])

    useEffect(() => {
        if (!rawData) {
            return
        }

        rawData.sort((a, b) => {
            a = a[sortField]
            b = b[sortField]

            if (typeof a === 'number') {
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

        setRows(
            rawData.map((item) => {
                return thematicFields.map((key) => ({
                    value: item[key],
                    dataKey: key,
                }))
            })
        )
    }, [rawData, sortField, sortDirection])

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

    return (
        <DataTable scrollHeight={'100%'} scrollWidth={'100%'} width={'100%'}>
            <DataTableHead>
                <DataTableRow>
                    {getHeaders().map(({ name, dataKey }, index) => (
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
                        {row.map(({ dataKey, value }) => (
                            <DataTableCell
                                key={`dtcell-${dataKey}`}
                                className={cx(
                                    styles.fontClass,
                                    styles.sizeClass,
                                    {
                                        [styles.darkText]:
                                            dataKey === 'color' &&
                                            isDarkColor(value),
                                    }
                                )}
                                backgroundColor={
                                    dataKey === 'color' ? value : null
                                }
                            >
                                {dataKey === 'color'
                                    ? value.toLowerCase()
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
