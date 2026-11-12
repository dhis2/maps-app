import i18n from '@dhis2/d2-i18n'
import { InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { FILTER_DATE, OPERATOR_BETWEEN } from '../../../constants/dataTable.js'
import { getFilterError, isValuelessFilter } from '../../../util/filter.js'
import { getDateOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

// Dates are stored as ISO strings, so the browser's date input matches them
const DateFilter = ({ draft, onChange }) => {
    const filter = { type: FILTER_DATE, operator: OPERATOR_BETWEEN, ...draft }
    const update = (changes) => onChange({ ...filter, ...changes })
    const error = getFilterError(filter)

    return (
        <div className={styles.stack}>
            <SingleSelectField
                dense
                label={i18n.t('Condition')}
                selected={filter.operator}
                onChange={({ selected }) => update({ operator: selected })}
                dataTest="data-table-filter-date-operator"
            >
                {getDateOperators().map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            {!isValuelessFilter(filter) && (
                <div className={styles.dateInputs}>
                    <InputField
                        dense
                        type="date"
                        label={i18n.t('From')}
                        value={filter.from ?? ''}
                        max={filter.to || undefined}
                        onChange={({ value }) => update({ from: value })}
                        dataTest="data-table-filter-date-from"
                    />
                    <InputField
                        dense
                        type="date"
                        label={i18n.t('To')}
                        value={filter.to ?? ''}
                        min={filter.from || undefined}
                        error={!!error}
                        validationText={error ?? undefined}
                        onChange={({ value }) => update({ to: value })}
                        dataTest="data-table-filter-date-to"
                    />
                </div>
            )}
        </div>
    )
}

DateFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default DateFilter
