import i18n from '@dhis2/d2-i18n'
import { Field, IconArrowRight16, CalendarInput, colors } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useKeyDown from '../../hooks/useKeyDown.js'
import {
    DEFAULT_CALENDAR,
    DEFAULT_PLACEHOLDER,
    formatDateInput,
    formatDateOnBlur,
    nextCharIsAutoHyphen,
    nextCharIsManualHyphen,
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

    const formattedStartDate = formatDateInput({ date: startDate })
    const formattedEndDate = formatDateInput({ date: endDate })

    const [startDateChangeCount, setStartDateChangeCount] = useState(0)
    const [endDateChangeCount, setEndDateChangeCount] = useState(0)

    const [startCaretPosition, setStartCaretPosition] = useState(null)
    const [endCaretPosition, setEndCaretPosition] = useState(null)

    const onDateChange = (type, date) => {
        const stateMap = {
            start: {
                prevDate: startDate,
                inputSelector: '.start input',
                dispatchAction: onSelectStartDate,
                setDateChangeCount: setStartDateChangeCount,
                setCaret: setStartCaretPosition,
            },
            end: {
                prevDate: endDate,
                inputSelector: '.end input',
                dispatchAction: onSelectEndDate,
                setDateChangeCount: setEndDateChangeCount,
                setCaret: setEndCaretPosition,
            },
        }
        if (!(type in stateMap)) {
            console.error(
                `Invalid type "${type}" passed to onDateChange. Expected "start" or "end".`
            )
            return
        }

        const {
            prevDate,
            inputSelector,
            dispatchAction,
            setDateChangeCount,
            setCaret,
        } = stateMap[type]

        if (prevDate === date) {
            return
        }

        const caret = document.querySelector(inputSelector)?.selectionStart
        const dateInfo = { date, prevDate, caret }

        let newCaretPosition = caret
        if (nextCharIsAutoHyphen(dateInfo)) {
            newCaretPosition = caret + 1
        } else if (nextCharIsManualHyphen(dateInfo)) {
            // No change needed for caret position
        } else if (/\D/.test(date?.[caret - 1] || '')) {
            newCaretPosition = caret - 1
        }
        setCaret(newCaretPosition)

        const formattedDate = formatDateInput(dateInfo)
        dispatch(dispatchAction(formattedDate))

        setDateChangeCount((prevCount) => prevCount + 1)
    }

    useEffect(() => {
        if (startCaretPosition !== null) {
            const input = document.querySelector('.start input')
            input.setSelectionRange(startCaretPosition, startCaretPosition)
        }
    }, [startDateChangeCount, startCaretPosition])

    useEffect(() => {
        if (endCaretPosition !== null) {
            const input = document.querySelector('.end input')
            input.setSelectionRange(endCaretPosition, endCaretPosition)
        }
    }, [endDateChangeCount, endCaretPosition])

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
                    date={formattedStartDate}
                    onDateSelect={(e) =>
                        dispatch(onSelectStartDate(e?.calendarDateString))
                    }
                    onChange={(e) => onDateChange('start', e?.value)}
                    onBlur={(e) =>
                        dispatch(onSelectStartDate(formatDateOnBlur(e?.value)))
                    }
                    placeholder={DEFAULT_PLACEHOLDER}
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
                    date={formattedEndDate}
                    onDateSelect={(e) =>
                        dispatch(onSelectEndDate(e?.calendarDateString))
                    }
                    onChange={(e) => onDateChange('end', e?.value)}
                    onBlur={(e) =>
                        dispatch(onSelectEndDate(formatDateOnBlur(e?.value)))
                    }
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
