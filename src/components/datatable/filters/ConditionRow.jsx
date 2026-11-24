import i18n from '@dhis2/d2-i18n'
import { Help, Input, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    FILTER_NUMBER,
    OPERATOR_BETWEEN,
} from '../../../constants/dataTable.js'
import { getFilterError } from '../../../util/filter.js'
import { getOperators } from './filterOperators.js'
import styles from './styles/Filters.module.css'

const INPUT_TYPES = { [FILTER_NUMBER]: 'number' }

const getPlaceholders = (filterType) =>
    filterType === FILTER_NUMBER
        ? { value: i18n.t('Number'), from: i18n.t('From'), to: i18n.t('To') }
        : { value: i18n.t('Text'), from: i18n.t('From'), to: i18n.t('To') }

// The condition of a column filter: an operator for the column's kind of values, and its value
const ConditionRow = ({ filterType, draft, onChange }) => {
    const isBetween = draft.operator === OPERATOR_BETWEEN
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
                        className={styles.operatorOption}
                    />
                ))}
            </SingleSelectField>
            <div className={styles.conditionInputs}>
                <Input
                    dense
                    initialFocus
                    type={inputType}
                    placeholder={
                        isBetween ? placeholders.from : placeholders.value
                    }
                    value={draft.value ?? ''}
                    onChange={({ value }) => onChange({ value })}
                    dataTest="data-table-filter-value"
                />
                {isBetween && (
                    <>
                        <span className={styles.and}>{i18n.t('and')}</span>
                        <Input
                            dense
                            type={inputType}
                            placeholder={placeholders.to}
                            value={draft.value2 ?? ''}
                            error={!!error}
                            onChange={({ value }) =>
                                onChange({ value2: value })
                            }
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
        </div>
    )
}

ConditionRow.propTypes = {
    draft: PropTypes.object.isRequired,
    filterType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default ConditionRow
