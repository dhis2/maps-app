import i18n from '@dhis2/d2-i18n'
import { Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { FILTER_TEXT, OPERATOR_CONTAINS } from '../../../constants/dataTable.js'
import { isValuelessFilter } from '../../../util/filter.js'
import { getTextOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

const TextFilter = ({ draft, onChange }) => {
    const filter = { type: FILTER_TEXT, operator: OPERATOR_CONTAINS, ...draft }
    const update = (changes) => onChange({ ...filter, ...changes })

    return (
        <div className={styles.stack}>
            <SingleSelectField
                dense
                label={i18n.t('Condition')}
                selected={filter.operator}
                onChange={({ selected }) => update({ operator: selected })}
                dataTest="data-table-filter-text-operator"
            >
                {getTextOperators().map(({ value, label }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={label}
                    />
                ))}
            </SingleSelectField>
            {!isValuelessFilter(filter) && (
                <Input
                    dense
                    initialFocus
                    placeholder={i18n.t('Type to filter')}
                    value={filter.value ?? ''}
                    onChange={({ value }) => update({ value })}
                    dataTest="data-table-filter-text-input"
                />
            )}
        </div>
    )
}

TextFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default TextFilter
