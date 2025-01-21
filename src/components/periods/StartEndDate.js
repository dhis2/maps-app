import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useKeyDown from '../../hooks/useKeyDown.js'
import {
    DEFAULT_CALENDAR,
    DEFAULT_PLACEHOLDER,
    formatDateInput,
    formatDateOnBlur,
} from '../../util/date.js'
import styles from './styles/StartEndDate.module.css'

const StartEndDate = ({
    onSelectStartDate,
    onSelectEndDate,
    errorText,
    periodsSettings,
}) => {
    const dispatch = useDispatch()

    const startDate = useSelector((state) => state.layerEdit.startDate || '')
    const endDate = useSelector((state) => state.layerEdit.endDate || '')

    const formattedStartDate = formatDateInput(startDate)
    const formattedEndDate = formatDateInput(endDate)

    const onStartDateChange = (value) => {
        const formattedDate = formatDateInput(value)
        dispatch(onSelectStartDate(formattedDate))
    }

    const onEndDateChange = (value) => {
        const formattedDate = formatDateInput(value)
        dispatch(onSelectEndDate(formattedDate))
    }

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
                    calendar={DEFAULT_CALENDAR}
                    locale={periodsSettings?.locale}
                    date={formattedStartDate}
                    onDateSelect={(e) =>
                        onStartDateChange(e?.calendarDateString)
                    }
                    onChange={(e) => onStartDateChange(e?.value)}
                    onBlur={(e) =>
                        onStartDateChange(formatDateOnBlur(e?.value))
                    }
                    placeholder={DEFAULT_PLACEHOLDER}
                    dataTest="start-date-input"
                    clearable={true}
                />
                <div className={styles.icon}>
                    <IconArrowRight16 color={colors.grey500} />
                </div>
                <CalendarInput
                    label={i18n.t('End date')}
                    calendar={DEFAULT_CALENDAR}
                    locale={periodsSettings?.locale}
                    date={formattedEndDate}
                    onDateSelect={(e) => onEndDateChange(e?.calendarDateString)}
                    onChange={(e) => onEndDateChange(e?.value)}
                    onBlur={(e) => onEndDateChange(formatDateOnBlur(e?.value))}
                    placeholder={DEFAULT_PLACEHOLDER}
                    dataTest="end-date-input"
                    clearable={true}
                />
            </div>
            {errorText && <div className={styles.error}>{errorText}</div>}
        </Field>
    )
}
StartEndDate.propTypes = {
    onSelectEndDate: PropTypes.func.isRequired,
    onSelectStartDate: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    periodsSettings: PropTypes.shape({
        calendar: PropTypes.string,
        locale: PropTypes.string,
    }),
}

export default StartEndDate
