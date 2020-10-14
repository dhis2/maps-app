import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import {
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui';
import styles from './styles/OrgUnitDialogTable.module.css';

const OrgUnitDataTable = ({ data }) =>
    data && data.length ? (
        <Table>
            <TableHead>
                <TableRowHead>
                    <TableCellHead dense>
                        {i18n.t('Data element')}
                    </TableCellHead>
                    <TableCellHead dense className={styles.right}>
                        {i18n.t('Value')}
                    </TableCellHead>
                </TableRowHead>
            </TableHead>
            <TableBody>
                {data.map(({ id, name, value }) => (
                    <TableRow key={id}>
                        <TableCell dense>{name}</TableCell>
                        <TableCell dense className={styles.right}>
                            {value}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ) : (
        <div className={styles.nodata}>
            {i18n.t('No data found for this period.')}
        </div>
    );

OrgUnitDataTable.propTypes = {
    data: PropTypes.array,
};

export default OrgUnitDataTable;
