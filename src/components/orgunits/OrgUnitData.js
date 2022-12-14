import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../util/api.js'
import PeriodSelect from '../periods/PeriodSelect.js'
import styles from './styles/OrgUnitData.module.css'

/*
 *  Displays a period selector and org unit data items (data elements, indicators, reporting rates, program indicators)
 */
const OrgUnitData = ({ id, periodType, defaultPeriod, data }) => {
    const [period, setPeriod] = useState(defaultPeriod)
    const [items, setItems] = useState(data)
    const [isLoading, setIsLoading] = useState(false)

    // Load data items if period is changed
    useEffect(() => {
        if (period.id === defaultPeriod.id) {
            setItems(data)
        } else {
            setIsLoading(true)
            apiFetch(`/organisationUnitProfile/${id}/data?period=${period.id}`)
                .then(({ dataItems }) => {
                    setItems(dataItems)
                    setIsLoading(false)
                })
                .then(setItems)
        }
    }, [id, period, defaultPeriod, data])

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
    )
}

OrgUnitData.propTypes = {
    defaultPeriod: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    periodType: PropTypes.string.isRequired,
    data: PropTypes.array,
}

export default OrgUnitData
