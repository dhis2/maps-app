import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { CircularLoader } from '@dhis2/ui';
import PeriodSelect from '../periods/PeriodSelect';
import { apiFetchTemp } from '../../util/api';
import styles from './styles/OrgUnitData.module.css';

const OrgUnitData = ({ id, periodType, defaultPeriod, data }) => {
    const [period, setPeriod] = useState(defaultPeriod);
    const [items, setItems] = useState(data);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (period.id === defaultPeriod.id) {
            setItems(data);
        } else {
            setIsLoading(true);
            apiFetchTemp(
                `/organisationUnitProfile/${id}/data?period=${period.id}`
            )
                .then(data => {
                    setItems(data.dataItems);
                    setIsLoading(false);
                })
                .then(setItems);
        }
    }, [id, period, defaultPeriod, data]);

    return (
        <div className={styles.orgUnitData}>
            <PeriodSelect
                label={null}
                periodType={periodType}
                period={period}
                onChange={setPeriod}
                className={styles.periodSelect}
            />
            <div className={styles.dataTable}>
                {isLoading && (
                    <div className={styles.loadingMask}>
                        <CircularLoader />
                    </div>
                )}
                {Array.isArray(items) && items.length ? (
                    <table>
                        <tbody>
                            {items.map(({ id, label, value }) => (
                                <tr key={id}>
                                    <th>{label}</th>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.noData}>
                        {i18n.t('No data found for this period.')}
                    </div>
                )}
            </div>
        </div>
    );
};

OrgUnitData.propTypes = {
    id: PropTypes.string.isRequired,
    periodType: PropTypes.string.isRequired,
    defaultPeriod: PropTypes.object.isRequired,
    data: PropTypes.array,
};

export default OrgUnitData;
