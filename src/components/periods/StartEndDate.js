import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DEFAULT_CALENDAR, DEFAULT_PLACEHOLDER } from '../../util/date.js'
import styles from './styles/StartEndDate.module.css'

const StartEndDate = ({
    onSelectStartDate,
    onSelectEndDate,
    onDateError,
    errorText,
    periodsSettings,
}) => {
    const dispatch = useDispatch()

    const startDate = useSelector((state) => state.layerEdit.startDate || '')
    const endDate = useSelector((state) => state.layerEdit.endDate || '')

    const hasDate = startDate !== undefined && endDate !== undefined
    if (!hasDate) {
        return null
    }

    return (
        <Field
            className={styles.field}
            helpText={i18n.t(
                'Start and end dates are inclusive and will be reflected in the outputs.'
            )}
        >
            {periodsSettings?.calendar !== DEFAULT_CALENDAR && (
                <p>
                    {i18n.t(
                        'Start and end dates must be entered using the ISO 8601 (Gregorian) date format.'
                    )}
                </p>
            )}
            <div className={styles.row}>
                <CalendarInput
                    className="start"
                    label={i18n.t('Start date')}
                    calendar={DEFAULT_CALENDAR}
                    locale={periodsSettings?.locale}
                    date={startDate}
                    onDateSelect={(e) => {
                        if (e.validation.valid && e?.calendarDateString) {
                            dispatch(onSelectStartDate(e?.calendarDateString))
                        } else if (
                            e.validation.valid &&
                            !e?.calendarDateString
                        ) {
                            dispatch(onSelectStartDate(e?.calendarDateString))
                            onDateError(
                                'startDateError',
                                i18n.t('Start date is empty')
                            )
                        } else {
                            onDateError(
                                'startDateError',
                                i18n.t('Start date is invalid')
                            )
                        }
                    }}
                    placeholder={DEFAULT_PLACEHOLDER}
                    width={styles.width}
                    dataTest="start-date-input"
                    clearable={true}
                />
                <div className={styles.icon}>
                    <IconArrowRight16 color={colors.grey500} />
                </div>
                <CalendarInput
                    className="end"
                    label={i18n.t('End date')}
                    calendar={DEFAULT_CALENDAR}
                    locale={periodsSettings?.locale}
                    date={endDate}
                    onDateSelect={(e) => {
                        if (e.validation.valid && e?.calendarDateString) {
                            dispatch(onSelectEndDate(e?.calendarDateString))
                        } else if (
                            e.validation.valid &&
                            !e?.calendarDateString
                        ) {
                            dispatch(onSelectEndDate(e?.calendarDateString))
                            onDateError(
                                'endDateError',
                                i18n.t('End date is empty')
                            )
                        } else {
                            onDateError(
                                'endDateError',
                                i18n.t('End date is invalid')
                            )
                        }
                    }}
                    placeholder={DEFAULT_PLACEHOLDER}
                    width={styles.width}
                    dataTest="end-date-input"
                    clearable={true}
                />
            </div>
            {errorText && <div className={styles.error}>{errorText}</div>}
        </Field>
    )
}
StartEndDate.propTypes = {
    onDateError: PropTypes.func.isRequired,
    onSelectEndDate: PropTypes.func.isRequired,
    onSelectStartDate: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    periodsSettings: PropTypes.shape({
        calendar: PropTypes.string,
        locale: PropTypes.string,
    }),
}

export default StartEndDate
