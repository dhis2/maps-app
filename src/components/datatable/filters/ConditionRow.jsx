import i18n from '@dhis2/d2-i18n'
import { Help, Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
    FILTER_DATE,
    FILTER_NUMBER,
    FILTER_TIME,
    OPERATOR_BETWEEN,
} from '../../../constants/dataTable.js'
import {
    DEFAULT_CALENDAR,
    DEFAULT_PLACEHOLDER,
    TIME_PLACEHOLDER,
    formatDateOnBlur,
    formatTimeInput,
    formatTimeOnBlur,
    typeDate,
} from '../../../util/date.js'
import { getFilterError } from '../../../util/filter.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import { CalendarInput } from '../../periods/CalendarInput.jsx'
import { getOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

const INPUT_TYPES = {
    [FILTER_NUMBER]: 'number',
}

// Dates are picked as in the layer dialogs, and compared as YYYY-MM-DD
const DateInput = ({ value, error, onChange, dataTest }) => {
    const { periodsSettings } = useCachedData()
    const ref = useRef()
    // A new object on every keystroke, so the caret is set again after each mask
    const [caret, setCaret] = useState(null)

    useEffect(() => {
        if (caret) {
            ref.current
                ?.querySelector('input')
                ?.setSelectionRange(caret.position, caret.position)
        }
    }, [caret])

    const onType = (date = '') => {
        if (date === value) {
            return
        }
        const input = ref.current?.querySelector('input')
        const typed = typeDate({
            date,
            prevDate: value,
            caret: input?.selectionStart,
        })
        setCaret({ position: typed.caret })
        onChange(typed.date)
    }

    return (
        <div ref={ref}>
            <CalendarInput
                dense
                calendar={DEFAULT_CALENDAR}
                locale={periodsSettings?.locale}
                date={value}
                error={error}
                placeholder={DEFAULT_PLACEHOLDER}
                onDateSelect={(date) =>
                    onChange(date?.calendarDateString ?? '')
                }
                onChange={(e) => onType(e?.value)}
                onBlur={(e) => onChange(formatDateOnBlur(e?.value ?? ''))}
                dataTest={dataTest}
            />
        </div>
    )
}

DateInput.propTypes = {
    dataTest: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.bool,
}

// Times are typed in 24-hour format, and compared as HH:MM
const TimeInput = ({ onChange, ...props }) => (
    <Input
        dense
        {...props}
        placeholder={TIME_PLACEHOLDER}
        onChange={({ value }) => onChange(formatTimeInput(value))}
        onBlur={({ value }) => onChange(formatTimeOnBlur(value))}
    />
)

TimeInput.propTypes = {
    onChange: PropTypes.func.isRequired,
}

// A condition value: the app's date picker for dates, a masked text input for times
const ValueInput = ({ filterType, inputType, onChange, ...props }) => {
    if (filterType === FILTER_DATE) {
        return <DateInput {...props} onChange={onChange} />
    }
    if (filterType === FILTER_TIME) {
        return <TimeInput {...props} onChange={onChange} />
    }
    return (
        <Input
            dense
            type={inputType}
            {...props}
            onChange={({ value }) => onChange(value)}
        />
    )
}

ValueInput.propTypes = {
    filterType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    inputType: PropTypes.string,
}

const getPlaceholders = (filterType) =>
    filterType === FILTER_NUMBER
        ? { value: i18n.t('Number'), from: i18n.t('From'), to: i18n.t('To') }
        : { value: i18n.t('Text'), from: i18n.t('From'), to: i18n.t('To') }

// The condition of a column filter: an operator for the column's kind of values, and its value
const ConditionRow = ({ filterType, draft, onChange }) => {
    const { periodsSettings } = useCachedData()
    const isBetween = draft.operator === OPERATOR_BETWEEN
    // As in the layer dialogs, where the instance uses another calendar
    const showsIsoDateNote =
        filterType === FILTER_DATE &&
        !!periodsSettings?.calendar &&
        periodsSettings.calendar !== DEFAULT_CALENDAR
    const inputType = INPUT_TYPES[filterType] ?? 'text'
    const placeholders = getPlaceholders(filterType)
    const error = getFilterError(draft)

    return (
        <div className={styles.stack}>
            <SingleSelectField
                dense
                label={i18n.t('Condition')}
                selected={draft.operator}
                onChange={({ selected }) => onChange({ operator: selected })}
                dataTest="data-table-filter-operator"
            >
                {getOperators(filterType).map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            <div className={styles.conditionInputs}>
                <ValueInput
                    filterType={filterType}
                    inputType={inputType}
                    initialFocus
                    placeholder={
                        isBetween ? placeholders.from : placeholders.value
                    }
                    value={draft.value ?? ''}
                    onChange={(value) => onChange({ value })}
                    dataTest="data-table-filter-value"
                />
                {isBetween && (
                    <>
                        <span className={styles.and}>{i18n.t('and')}</span>
                        <ValueInput
                            filterType={filterType}
                            inputType={inputType}
                            placeholder={placeholders.to}
                            value={draft.value2 ?? ''}
                            error={!!error}
                            onChange={(value2) => onChange({ value2 })}
                            dataTest="data-table-filter-value2"
                        />
                    </>
                )}
            </div>
            {error && (
                <Help error className={styles.conditionError}>
                    {error}
                </Help>
            )}
            {showsIsoDateNote && (
                <Help className={styles.conditionError}>
                    {i18n.t(
                        'Dates must be entered using the ISO 8601 (Gregorian) date format.'
                    )}
                </Help>
            )}
        </div>
    )
}

ConditionRow.propTypes = {
    draft: PropTypes.object.isRequired,
    filterType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default ConditionRow
