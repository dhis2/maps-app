import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import styles from './styles/StartEndDate.module.css'

const formatDate = (date, calendar = 'iso8601') => {
    if (calendar === 'iso8601') {
        return formatDateIso8601(date)
    }
    return formatDateDefault(date)
}
const formatDateDefault = (date) => {
    if (!date) {
        return ''
    }
    return date
}
const formatDateIso8601 = (date) => {
    if (!date) {
        return ''
    }

    const numericDate = date.replace(/\D/g, '')

    if (numericDate.length < 5) {
        return numericDate
    }

    const year = numericDate.slice(0, 4)
    const month = numericDate.slice(4, 6)
    const day = numericDate.slice(6, 8)

    if (numericDate.length < 7) {
        return `${year}-${month}`
    }
    if (numericDate.length < 8) {
        return `${year}-${month}-${day}`
    }

    const formattedYear = year === '0000' ? '2000' : year
    let formattedMonth = month === '00' ? '01' : month
    formattedMonth = formattedMonth > 12 ? '12' : formattedMonth

    let formattedDay = day === '00' ? '01' : day

    const maxDaysInMonth = getMaxDaysInMonth(formattedYear, formattedMonth)
    formattedDay = formattedDay > maxDaysInMonth ? maxDaysInMonth : formattedDay

    return `${formattedYear}-${formattedMonth}-${formattedDay}`
}

const getMaxDaysInMonth = (year, month) => {
    const monthDays = {
        '02': 28,
        '04': 30,
        '06': 30,
        '09': 30,
        11: 30,
    }

    if (month === '02') {
        return isLeapYear(year) ? 29 : 28
    }

    return monthDays[month] || 31
}

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const createBoundHandler = (localSetter, reduxSetter, calendar) => (value) => {
    const formattedDate = formatDate(value, calendar)
    localSetter(formattedDate)
    reduxSetter(formattedDate)
}

const StartEndDate = (props) => {
    const {
        startDate = '',
        endDate = '',
        setStartDate,
        setEndDate,
        errorText,
        periodsSettings,
    } = props
    const [startDateInput, setStartDateInput] = useState(
        formatDate(startDate, periodsSettings?.calendar)
    )
    const [endDateInput, setEndDateInput] = useState(
        formatDate(endDate, periodsSettings?.calendar)
    )

    const onStartDateChange = createBoundHandler(
        setStartDateInput,
        setStartDate,
        periodsSettings?.calendar
    )
    const onEndDateChange = createBoundHandler(
        setEndDateInput,
        setEndDate,
        periodsSettings?.calendar
    )

    // Forces calendar to close when using Tab/Enter navigation
    useKeyDown(['Tab', 'Enter'], () => {
        const backdropElement = document.querySelectorAll('.backdrop')
        if (backdropElement?.length === 3) {
            backdropElement[2].click()
        }
    })

    const hasDate = startDate !== undefined && endDate !== undefined
    if (!hasDate) {
        return null
    }

    return (
        <Field
            helpText={i18n.t(
                'Start and end dates are inclusive and will be included in the outputs.'
            )}
        >
            <div className={styles.row}>
                <CalendarInput
                    label={i18n.t('Start date')}
                    calendar={periodsSettings?.calendar}
                    locale={periodsSettings?.locale}
                    date={startDateInput}
                    onDateSelect={(e) =>
                        onStartDateChange(e?.calendarDateString)
                    }
                    onChange={(e) => onStartDateChange(e?.value)}
                    placeholder="YYYY-MM-DD"
                    dataTest="start-date-input"
                    strictValidation={true}
                />
                <div className={styles.icon}>
                    <IconArrowRight16 color={colors.grey500} />
                </div>
                <CalendarInput
                    label={i18n.t('End date')}
                    calendar={periodsSettings?.calendar}
                    locale={periodsSettings?.locale}
                    date={endDateInput}
                    onDateSelect={(e) => onEndDateChange(e?.calendarDateString)}
                    onChange={(e) => onEndDateChange(e?.value)}
                    placeholder="YYYY-MM-DD"
                    dataTest="end-date-input"
                    strictValidation={true}
                />
            </div>
            {errorText && (
                <div key="error" className={styles.error}>
                    {errorText}
                </div>
            )}
        </Field>
    )
}
StartEndDate.propTypes = {
    setEndDate: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    endDate: PropTypes.string,
    errorText: PropTypes.string,
    periodsSettings: PropTypes.shape({
        calendar: PropTypes.string,
        locale: PropTypes.string,
    }),
    startDate: PropTypes.string,
}

export default connect(null, { setStartDate, setEndDate })(StartEndDate)
