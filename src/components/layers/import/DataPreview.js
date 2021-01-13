import React, { useState, useEffect } from 'react';
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
import { apiFetch } from '../../../util/api';
import { numberPrecision } from '../../../util/numbers';
import styles from './styles/DataPreview.module.css';

const DataPreview = ({
    dataSet,
    period,
    valueType,
    dataElement,
    data,
    precision,
}) => {
    const [currentValues, setCurrentValues] = useState({});
    const valueFormat = numberPrecision(precision);

    useEffect(() => {
        const orgUnits = data.map(({ id }) => `orgUnit=${id}`).join('&');

        // TODO: Possible to specify dataElement.id?
        const url = `/dataValueSets?dataSet=${dataSet.id}&period=${period.id}&${orgUnits}`;

        apiFetch(url)
            .then(({ dataValues }) =>
                setCurrentValues(
                    dataValues
                        .filter(d => d.dataElement === dataElement.id)
                        .reduce(
                            (obj, { orgUnit, value }) => ({
                                ...obj,
                                [orgUnit]: Number(value),
                            }),
                            {}
                        )
                )
            )
            .catch(console.error); // TODO
    }, [dataSet, dataElement, period, data]);

    return (
        <Table dense className={styles.table}>
            <TableHead>
                <TableRowHead>
                    <TableCellHead dense>{i18n.t('Name')}</TableCellHead>
                    <TableCellHead dense className={styles.right}>
                        {i18n.t('Current value')}
                    </TableCellHead>
                    <TableCellHead dense className={styles.right}>
                        {i18n.t('New value')}
                    </TableCellHead>
                </TableRowHead>
            </TableHead>
            <TableBody>
                {data.map(({ properties }) => {
                    const { id, name } = properties;
                    const current = currentValues[id];
                    const value = valueFormat(properties[valueType.id]);

                    return (
                        <TableRow key={id}>
                            <TableCell dense>{name}</TableCell>
                            <TableCell dense className={styles.current}>
                                {current !== undefined ? current : ''}
                            </TableCell>
                            <TableCell dense className={styles.right}>
                                {value}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

DataPreview.propTypes = {
    period: PropTypes.object.isRequired,
    valueType: PropTypes.object.isRequired,
    dataSet: PropTypes.object.isRequired,
    dataElement: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    precision: PropTypes.number,
};

export default DataPreview;
