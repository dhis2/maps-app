import i18n from '@dhis2/d2-i18n'
import { CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import StartEndDates from '../../periods/StartEndDates.js'
import { getTimeRange } from '../../../util/earthEngine.js'
import { formatDate, formatStartEndDate } from '../../../util/time.js'
import styles from './styles/PeriodReducer.module.css'

const PeriodRange = ({
    datasetId,
    period,
    reducer,
    onChange,
    errorText,
    className,
}) => {
    const [dateRange, setDateRange] = useState()

    useEffect(() => {
        getTimeRange(datasetId).then(setDateRange)
    }, [datasetId])

    useEffect(() => {
        if (dateRange) {
            const endDate = dateRange.lastDate
            const startDate = formatDate(
                new Date().setDate(new Date(endDate).getDate() - 7)
            )

            onChange({
                startDate,
                endDate,
                name: formatStartEndDate(startDate, endDate),
            })
        }
    }, [dateRange])

    // console.log('dateRange', datasetId, dateRange, period)

    if (!dateRange) {
        return (
            <div className={styles.loading}>
                <CircularLoader small />
                {i18n.t('Loading periods')}
            </div>
        )
    }

    // TODO: Make dynamic
    const startDate = formatDate(
        new Date().setDate(new Date(dateRange.lastDate).getDate() - 7)
    )

    return (
        <div>
            <StartEndDates
                dateRange={dateRange}
                startDate={startDate}
                endDate={dateRange.lastDate}
                // onChange={console.log}
                // className={styles.periodSelect}
                // errorText={errorText}
            />
        </div>
    )
}

PeriodRange.propTypes = {}

export default PeriodRange
