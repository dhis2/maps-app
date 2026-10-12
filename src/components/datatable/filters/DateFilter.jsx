import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { getFilterError } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

const DateFilter = ({ draft, onChange }) => {
    const filter = { type: 'date', ...draft }
    const update = (changes) => onChange({ ...filter, ...changes })
    const error = getFilterError(filter)

    return (
        <div className={styles.dateInputs}>
            <InputField
                dense
                type="date"
                label={i18n.t('From')}
                value={filter.from ?? ''}
                max={filter.to || undefined}
                onChange={({ value }) => update({ from: value })}
                dataTest="filter-date-from"
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
                dataTest="filter-date-to"
            />
        </div>
    )
}

DateFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default DateFilter
