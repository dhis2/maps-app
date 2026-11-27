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
import TableMessage from './TableMessage.jsx'

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
                {...props}
            />
        )
    }
)

DataTableRowWithVirtuosoContext.propTypes = {
    context: PropTypes.shape({
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

const getEmptyMessage = (context) => {
    if (context.showServerClusterAction) {
        return {
            title: i18n.t('Event details are not available'),
            description: i18n.t('This layer is clustered on the server.'),
            action: {
                label: i18n.t('Show event details'),
                onClick: context.onForceClientCluster,
            },
        }
    }
    if (context.totalCount > 0) {
        return {
            title: i18n.t('No matching rows'),
            description: i18n.t('Try changing or clearing your filters.'),
            action: context.hasActiveFilters
                ? {
                      label: i18n.t('Clear filters'),
                      onClick: context.onClearFilters,
                  }
                : undefined,
        }
    }
    return context.noDataMessage
}

export const EmptyPlaceholder = ({ context }) => (
    <tbody>
        <tr>
            <td colSpan={99999}>
                <TableMessage {...getEmptyMessage(context)} />
            </td>
        </tr>
    </tbody>
)

EmptyPlaceholder.propTypes = {
    context: PropTypes.shape({
        hasActiveFilters: PropTypes.bool,
        noDataMessage: PropTypes.shape({
            description: PropTypes.string,
            title: PropTypes.string,
        }),
        showServerClusterAction: PropTypes.bool,
        totalCount: PropTypes.number,
        onClearFilters: PropTypes.func,
        onForceClientCluster: PropTypes.func,
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
