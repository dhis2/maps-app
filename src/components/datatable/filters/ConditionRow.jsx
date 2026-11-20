import i18n from '@dhis2/d2-i18n'
import { Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { getOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

// The condition of a column filter: an operator for the column's kind of values, and its value
const ConditionRow = ({ filterType, draft, onChange }) => (
    <div className={styles.stack}>
        <SingleSelectField
            dense
            label={i18n.t('Condition')}
            selected={draft.operator}
            onChange={({ selected }) => onChange({ operator: selected })}
            dataTest="data-table-filter-operator"
        >
            {getOperators(filterType).map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}
        </SingleSelectField>
        <Input
            dense
            initialFocus
            placeholder={i18n.t('Text')}
            value={draft.value ?? ''}
            onChange={({ value }) => onChange({ value })}
            dataTest="data-table-filter-value"
        />
    </div>
)

ConditionRow.propTypes = {
    draft: PropTypes.object.isRequired,
    filterType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default ConditionRow
