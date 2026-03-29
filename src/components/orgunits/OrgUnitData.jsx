import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import {
    getFixedPeriodsByType,
    filterFuturePeriods,
} from '../../util/periods.js'
import PeriodSelect from '../periods/PeriodSelect.jsx'
import styles from './styles/OrgUnitData.module.css'

const ORGUNIT_PROFILE_QUERY = {
    profile: {
        resource: 'organisationUnitProfile',
        id: ({ id }) => `${id}/data`,
        params: ({ period }) => ({
            period,
        }),
    },
}

// Only YEARLY period type is supported in first version
const periodType = 'YEARLY'
const year = String(new Date().getFullYear())
const periods = getFixedPeriodsByType({ periodType, year })
const defaultPeriod = filterFuturePeriods(periods)[0] || periods[0]

/*
 *  Displays a period selector and org unit data items
 * (data elements, indicators, reporting rates, program indicators)
 */
const OrgUnitData = ({ id }) => {
    const [period, setPeriod] = useState(defaultPeriod)
    const { loading, data, refetch } = useDataQuery(ORGUNIT_PROFILE_QUERY, {
        lazy: true,
    })

    useEffect(() => {
        if (id && period) {
            refetch({
                id,
                period: period.id,
            })
        }
    }, [id, period, refetch])

    return (
        <div className={styles.orgUnitData} data-test="org-unit-data">
            <PeriodSelect
                label={null}
                periodType={periodType}
                period={period}
                onChange={setPeriod}
                className={styles.periodSelect}
            />
            <div className={styles.dataTable}>
                {loading && (
                    <div className={styles.loadingMask}>
                        <CircularLoader />
                    </div>
                )}
                {Array.isArray(data?.profile.dataItems) &&
                data.profile.dataItems.length ? (
                    <table data-test="org-unit-data-table">
                        <tbody>
                            {data.profile.dataItems.map(
                                ({ id, label, value }) => (
                                    <tr key={id}>
                                        <th>{label}</th>
                                        <td>{value}</td>
                                    </tr>
                                )
                            )}
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
    id: PropTypes.string.isRequired,
}

export default OrgUnitData
