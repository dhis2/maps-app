import i18n from '@dhis2/d2-i18n'
import { Help, Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    FILTER_NUMBER,
    OPERATOR_BETWEEN,
    OPERATOR_GREATER,
} from '../../../constants/dataTable.js'
import { getFilterError, isValuelessFilter } from '../../../util/filter.js'
import { getNumberOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

const NumberFilter = ({ draft, onChange }) => {
    const filter = { type: FILTER_NUMBER, operator: OPERATOR_GREATER, ...draft }
    const isBetween = filter.operator === OPERATOR_BETWEEN
    const update = (changes) => onChange({ ...filter, ...changes })
    const error = getFilterError(filter)

    return (
        <div className={styles.stack}>
            <SingleSelectField
                dense
                label={i18n.t('Condition')}
                selected={filter.operator}
                onChange={({ selected }) => update({ operator: selected })}
                dataTest="data-table-filter-number-operator"
            >
                {getNumberOperators().map(({ value, label, symbol }) => (
                    <SingleSelectOption
                        key={value}
                        value={value}
                        label={symbol ? `${label} (${symbol})` : label}
                    />
                ))}
            </SingleSelectField>
            {!isValuelessFilter(filter) && (
                <div className={styles.numberInputs}>
                    <Input
                        dense
                        initialFocus
                        type="number"
                        placeholder={
                            isBetween ? i18n.t('Min') : i18n.t('Value')
                        }
                        value={filter.value ?? ''}
                        onChange={({ value }) => update({ value })}
                        dataTest="data-table-filter-number-value"
                    />
                    {isBetween && (
                        <>
                            <span className={styles.and}>{i18n.t('and')}</span>
                            <Input
                                dense
                                type="number"
                                placeholder={i18n.t('Max')}
                                value={filter.value2 ?? ''}
                                error={!!error}
                                onChange={({ value }) =>
                                    update({ value2: value })
                                }
                                dataTest="data-table-filter-number-value2"
                            />
                        </>
                    )}
                </div>
            )}
            {error && (
                <Help error className={styles.rangeError}>
                    {error}
                </Help>
            )}
        </div>
    )
}

NumberFilter.propTypes = {
    onChange: PropTypes.func.isRequired,
    draft: PropTypes.object,
}

export default NumberFilter
