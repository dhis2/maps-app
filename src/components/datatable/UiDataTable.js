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
import { isValidUid } from 'd2/uid' // TODO replace
import { debounce } from 'lodash/fp'
import React, {
    // useState,
    useEffect,
    useReducer,
    useCallback,
    useMemo,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeDataTable } from '../../actions/dataTable.js'
import { highlightFeature } from '../../actions/feature.js'
import { setOrgUnitProfile } from '../../actions/orgUnits.js'
import {
    EVENT_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    // EARTH_ENGINE_LAYER,
} from '../../constants/layers.js'
import { numberValueTypes } from '../../constants/valueTypes.js'
import { isDarkColor } from '../../util/colors.js'
import { filterData } from '../../util/filter.js'
import FilterInput from './FilterInput.js'
import styles from './styles/UiDataTable.module.css'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

const getThematicHeaders = () => [
    { name: i18n.t('Index'), dataKey: 'index' },
    { name: i18n.t('Name'), dataKey: 'name', type: TYPE_STRING },
    { name: i18n.t('Id'), dataKey: 'id', type: TYPE_STRING },
    { name: i18n.t('Value'), dataKey: 'value', type: TYPE_NUMBER },
    { name: i18n.t('Legend'), dataKey: 'legend', type: TYPE_STRING },
    { name: i18n.t('Range'), dataKey: 'range', type: TYPE_STRING },
    { name: i18n.t('Level'), dataKey: 'level', type: TYPE_NUMBER },
    { name: i18n.t('Parent'), dataKey: 'parentName', type: TYPE_STRING },
    { name: i18n.t('Type'), dataKey: 'type', type: TYPE_STRING },
    {
        name: i18n.t('Color'),
        dataKey: 'color',
        type: TYPE_STRING,
        renderer: 'rendercolor',
    },
]

const TYPE_NUMBER = 'number'
const TYPE_STRING = 'string'
const TYPE_DATE = 'date'

const getEventHeaders = (layer) => {
    const defaultFieldsStart = [
        { name: i18n.t('Index'), dataKey: 'index' },
        { name: i18n.t('Org unit'), dataKey: 'ouname', type: TYPE_STRING },
        { name: i18n.t('Id'), dataKey: 'id', type: TYPE_STRING },
        {
            name: i18n.t('Event time'),
            dataKey: 'eventdate',
            type: TYPE_DATE,
            renderer: 'formatTime...',
        },
    ]

    const { headers = [] } = layer

    const customFields = headers
        .filter(({ name }) => isValidUid(name))
        .map(({ name, column, valueType }) => ({
            name: column,
            dataKey: name,
            type: numberValueTypes.includes(valueType)
                ? TYPE_NUMBER
                : TYPE_STRING,
        }))

    const defaultFieldsEnd = [{ name: i18n.t('Type'), dataKey: 'type' }]

    if (layer.styleDataItem) {
        defaultFieldsEnd.push({
            name: i18n.t('Color'),
            dataKey: 'color',
            type: TYPE_STRING,
            renderer: 'rendercolor',
        })
    }

    return defaultFieldsStart.concat(customFields).concat(defaultFieldsEnd)
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

const getHeaders = (layer, styleDataItem) => {
    if (layer.layer === THEMATIC_LAYER) {
        return getThematicHeaders()
    } else if (layer.layer === EVENT_LAYER) {
        return getEventHeaders(layer, styleDataItem)
    } else if (layer.layer === ORG_UNIT_LAYER) {
        return getOrgUnitHeaders(layer, styleDataItem)
    }
    //  else if (layer.layer === EARTH_ENGINE_LAYER) {
    // }
}

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
            .map((d, i) => ({
                index: i,
                ...d,
            }))
            .filter((d) => !d.properties.hasAdditionalGeometry)
            .map((d, i) => ({
                ...(d.properties || d),
                ...aggregations[d.id],
                index: d.index,
                i,
            }))

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

        return filteredData.map((item) =>
            getHeaders(layer).map(({ dataKey }) => ({
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
    const highlightMapFeature = debounce(50, (id) => {
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
    })

    // TODO - need this implemented in ui
    // const onMouseOver = (row) => console.log('row', row)
    // const onRowMouseOut = () => highlightMapFeature()

    return (
        <DataTable scrollHeight={'100%'} scrollWidth={'100%'} width={'100%'}>
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
                        // onMouseOver={() => onMouseOver(row)}
                    >
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
                                onClick={() => onTableRowClick(row)}
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
