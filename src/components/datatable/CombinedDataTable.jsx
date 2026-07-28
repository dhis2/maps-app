import i18n from '@dhis2/d2-i18n'
import {
    DataTable,
    DataTableBody,
    DataTableHead,
    DataTableRow,
    DataTableColumnHeader,
    DataTableCell,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect } from 'react'
import { TableVirtuoso } from 'react-virtuoso'
import styles from './styles/CombinedDataTable.module.css'
import { useCombinedTableData } from './useCombinedTableData.js'

const TABLE_STYLE = { height: '100%', width: '100%' }
const LARGE_FEATURE_THRESHOLD_LABEL = '10,000'

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
    onCountChange,
}) => {
    const { headers, rows, spatialWarning } = useCombinedTableData({
        layers,
        joinConfig,
    })

    useEffect(() => {
        onCountChange?.(rows.length, rows.length)
    }, [onCountChange, rows.length])

    const fixedHeaderContent = useCallback(
        () => (
            <DataTableRow>
                {headers.map(({ name, dataKey }) => (
                    <DataTableColumnHeader key={dataKey} name={dataKey}>
                        {name}
                    </DataTableColumnHeader>
                ))}
            </DataTableRow>
        ),
        [headers]
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
    onCountChange: PropTypes.func,
}

export default CombinedDataTable
