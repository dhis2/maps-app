import i18n from '@dhis2/d2-i18n'
import { Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { getNumberOperators } from './filterHelpers.js'
import styles from './styles/Filters.module.css'

const NumberFilter = ({ draft, onChange }) => {
    const filter = { type: 'number', operator: 'gt', ...draft }
    const isBetween = filter.operator === 'between'
    const update = (changes) => onChange({ ...filter, ...changes })

    return (
        <div className={styles.stack}>
            <SingleSelectField
                dense
                label={i18n.t('Condition')}
                selected={filter.operator}
                onChange={({ selected }) => update({ operator: selected })}
                dataTest="filter-number-operator"
            >
                {getNumberOperators().map(({ value, label, symbol }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={`${label} (${symbol})`}
                    />
                ))}
            </SingleSelectField>
            <div className={styles.numberInputs}>
                <Input
                    dense
                    autoFocus
                    type="number"
                    placeholder={isBetween ? i18n.t('Min') : i18n.t('Value')}
                    value={filter.value ?? ''}
                    onChange={({ value }) => update({ value })}
                    dataTest="filter-number-value"
                />
                {isBetween && (
                    <>
                        <span className={styles.and}>{i18n.t('and')}</span>
                        <Input
                            dense
                            type="number"
                            placeholder={i18n.t('Max')}
                            value={filter.value2 ?? ''}
                            onChange={({ value }) => update({ value2: value })}
                            dataTest="filter-number-value2"
                        />
                    </>
                )}
            </div>
        </div>
    )
}

NumberFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default NumberFilter
