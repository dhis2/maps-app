import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { setStartDate, setEndDate } from '../../actions/layerEdit.js'
import useKeyDown from '../../hooks/useKeyDown.js'
import styles from './styles/StartEndDate.module.css'
import { formatDateInput } from '../../util/date.js'

const createBoundHandler = (localSetter, reduxSetter, calendar) => (value) => {
    const formattedDate = formatDateInput(value, calendar)
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
        formatDateInput(startDate, periodsSettings?.calendar)
    )
    const [endDateInput, setEndDateInput] = useState(
        formatDateInput(endDate, periodsSettings?.calendar)
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
                    clearable={true}
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
                    clearable={true}
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
