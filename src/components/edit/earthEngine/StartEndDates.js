import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { DatePicker } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const StartEndDates = ({
    dateRange,
    period,
    onChange,
    errorText,
    className,
}) => {
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
    dateRange: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
    period: PropTypes.shape({
        endDate: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
    }),
}

export default StartEndDates
