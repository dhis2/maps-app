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
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useReducer } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import { SORT_ASCENDING } from '../../constants/dataTable.js'
import { getNextSorting, isFilterable } from '../../util/dataTable.js'
import { SortIcon } from '../core/icons.jsx'
import styles from './styles/CombinedDataTable.module.css'
import dataTableStyles from './styles/DataTable.module.css'
import TopTooltip from './TopTooltip.jsx'
import { useCombinedTableData } from './useCombinedTableData.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const LARGE_FEATURE_THRESHOLD_LABEL = '10,000'
const EMPTY_FILTERS = {}

const CombinedTable = (props) => (
    <DataTable {...props} className={styles.dataTable} />
)

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
    TableRow: DataTableRow,
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

    const { headers, rows, spatialWarning } = useCombinedTableData({
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
        [headers, filters, onFilterChange, sortData, sortField, sortDirection]
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
                components={CombinedTableComponents}
                style={TABLE_STYLE}
                data={rows}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={(_, row) => (
                    <>
                        {row.map(({ dataKey, value, align }) => (
                            <DataTableCell
                                key={dataKey}
                                staticStyle
                                align={align}
                            >
                                {value ?? '—'}
                            </DataTableCell>
                        ))}
                    </>
                )}
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
