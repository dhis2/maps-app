import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import PeriodSelect from '../periods/PeriodSelect.js'
import styles from './styles/OrgUnitData.module.css'

const OrgUnitData = ({ id, periodType, defaultPeriod, data }) => {
    const [period, setPeriod] = useState(defaultPeriod)
    const [items, setItems] = useState(data)
    const [isLoading, setIsLoading] = useState(false)
    const engine = useDataEngine()

    useEffect(() => {
        const fetchOrgUnitProfile = async () => {
            setIsLoading(true)
            const query = {
                orgUnitProfile: {
                    resource: `organisationUnitProfile/${id}/data`,
                    params: {
                        period: period.id,
                    },
                },
            }
            const { orgUnitProfile } = await engine.query(query)
            setItems(orgUnitProfile.dataItems)
            setIsLoading(false)
        }

        if (period.id === defaultPeriod.id) {
            setItems(data)
        } else {
            fetchOrgUnitProfile()
        }
    }, [id, period, defaultPeriod, data, engine])

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
