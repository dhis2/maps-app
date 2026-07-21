import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableRow,
    DataTableBody,
    DataTableHead,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/TableVirtuosoComponents.module.css'

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

const DataTableRowWithVirtuosoContext = React.memo(
    function DataTableRowWithVirtuosoContext({ context, item, ...props }) {
        return (
            <DataTableRow
                onMouseEnter={() => context.onMouseEnter(item)}
                onMouseLeave={context.onMouseLeave}
                onContextMenu={(e) => context.onContextMenu(e, item)}
                onClick={(e) => context.onRowClick(item, e)}
                onDoubleClick={() => context.onRowDoubleClick(item)}
                {...props}
            />
        )
    }
)

DataTableRowWithVirtuosoContext.propTypes = {
    context: PropTypes.shape({
        onContextMenu: PropTypes.func,
        onMouseEnter: PropTypes.func,
        onMouseLeave: PropTypes.func,
        onRowClick: PropTypes.func,
        onRowDoubleClick: PropTypes.func,
    }),
    item: PropTypes.arrayOf(
        PropTypes.shape({
            dataKey: PropTypes.string,
            itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        })
    ),
}

const EmptyPlaceholder = ({ context }) => (
    <tbody>
        <tr>
            <td colSpan={99999}>
                <div className={styles.noResults}>
                    {context.totalCount > 0 ? (
                        <>
                            {i18n.t('No features match your filters')}
                            {context.hasActiveFilters && (
                                <button
                                    type="button"
                                    className={styles.clearFiltersLink}
                                    onClick={context.onClearFilters}
                                >
                                    {i18n.t('Clear filters')}
                                </button>
                            )}
                        </>
                    ) : (
                        i18n.t('No results found')
                    )}
                </div>
            </td>
        </tr>
    </tbody>
)

EmptyPlaceholder.propTypes = {
    context: PropTypes.shape({
        hasActiveFilters: PropTypes.bool,
        totalCount: PropTypes.number,
        onClearFilters: PropTypes.func,
    }),
}

const TableComponents = {
    Table: DataTableWithVirtuosoContext,
    TableBody: DataTableBody,
    TableHead: DataTableHead,
    TableRow: DataTableRowWithVirtuosoContext,
    EmptyPlaceholder,
}

export default TableComponents
