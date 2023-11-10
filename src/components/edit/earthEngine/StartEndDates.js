import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect } from 'react'
import {
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
} from '../../../constants/layers.js'
import { DatePicker } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'
import { DataQuery } from '@dhis2/app-runtime'

const StartEndDates = ({
    dateRange,
    period,
    onChange,
    errorText,
    className,
}) => {
    // console.log('StartEndDates', dateRange, period)

    /*
    const hasDate = startDate !== undefined && endDate !== undefined

    useEffect(() => {
        if (!hasDate) {
            setStartDate(DEFAULT_START_DATE)
            setEndDate(DEFAULT_END_DATE)
        }
    }, [hasDate, setStartDate, setEndDate])
    */

    useEffect(() => {
        const { firstDate, lastDate } = dateRange

        if (!period) {
            onChange({
                startDate: firstDate, // TODO: End date minus days
                endDate: lastDate,
            })
        }
    }, [dateRange, period, onChange])

    if (!period) {
        return null
    }

    const { startDate, endDate } = period

    const setStartDate = (startDate) => onChange({ startDate, endDate })
    const setEndDate = (endDate) => onChange({ startDate, endDate })

    return (
        <>
            <DatePicker
                label={i18n.t('Start date')}
                defaultVal={startDate}
                onBlur={setStartDate}
                className={className || styles.select}
            />
            <DatePicker
                label={i18n.t('End date')}
                defaultVal={endDate}
                onBlur={setEndDate}
                className={className || styles.select}
            />
            {errorText && (
                <div key="error" className={styles.error}>
                    {errorText}
                </div>
            )}
        </>
    )
}

StartEndDates.propTypes = {
    onChange: PropTypes.func.isRequired,
    dateRange: PropTypes.object.isRequired,
    className: PropTypes.string,
    endDate: PropTypes.string,
    errorText: PropTypes.string,
    startDate: PropTypes.string,
}

export default StartEndDates
