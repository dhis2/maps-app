import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { loadOptionSet } from '../../actions/optionSets.js'
import {
    numberValueTypes,
    textValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes.js'
import {
    SelectField,
    NumberField,
    TextField,
    Checkbox,
    DatePicker,
} from '../core/index.js'
import OptionSetSelect from '../optionSet/OptionSetSelect.js'
import styles from './styles/FilterSelect.module.css'

const getOperators = (valueType, optionSet) => {
    let operators

    if (['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'DATE'].includes(valueType)) {
        operators = [
            { id: 'EQ', name: '=' },
            { id: 'GT', name: '>' },
            { id: 'GE', name: '>=' },
            { id: 'LT', name: '<' },
            { id: 'LE', name: '<=' },
            { id: 'NE', name: '!=' },
        ]
    } else if (optionSet) {
        operators = [{ id: 'IN', name: i18n.t('one of') }]
    } else if (textValueTypes.includes(valueType)) {
        operators = [
            { id: 'LIKE', name: i18n.t('contains') },
            { id: 'EQ', name: i18n.t('is') },
            { id: 'NE', name: i18n.t('is not') },
        ]
    }

    return operators
}

const FilterSelect = ({
    valueType,
    filter,
    optionSet,
    optionSets,
    onChange,
    loadOptionSet,
}) => {
    const operators = getOperators(valueType, optionSet)
    let operator
    let value

    if (filter) {
        const splitFilter = filter.split(':')
        operator = splitFilter[0]
        value = splitFilter[1]
    } else if (operators) {
        operator = operators[0].id
    }

    useEffect(() => {
        if (optionSet && !optionSets[optionSet.id]) {
            loadOptionSet(optionSet.id)
        }
    }, [optionSet, optionSets, loadOptionSet])

    return (
        <Fragment>
            {operators && (
                <SelectField
                    label={i18n.t('Operator')}
                    items={operators}
                    value={operator}
                    onChange={(newOperator) =>
                        onChange(`${newOperator.id}:${value ? value : ''}`)
                    }
                    className={styles.operator}
                />
            )}
            {optionSet && optionSets[optionSet.id] && (
                <OptionSetSelect
                    options={optionSets[optionSet.id].options}
                    value={value ? value.split(';') : null}
                    onChange={(newValue) =>
                        onChange(`${operator}:${newValue.join(';')}`)
                    }
                    className={styles.inputField}
                />
            )}
            {numberValueTypes.includes(valueType) && (
                <NumberField
                    label={i18n.t('Value')}
                    value={value !== undefined ? Number(value) : value}
                    onChange={(newValue) => onChange(`${operator}:${newValue}`)}
                    className={styles.inputField}
                />
            )}
            {textValueTypes.includes(valueType) && !optionSet && (
                <TextField
                    label={i18n.t('Value')}
                    value={value || ''}
                    onChange={(newValue) => onChange(`${operator}:${newValue}`)}
                    className={styles.inputField}
                />
            )}
            {booleanValueTypes.includes(valueType) && (
                <Checkbox
                    label={i18n.t('Yes')}
                    checked={value == 1 ? true : false}
                    onChange={(isChecked) =>
                        onChange(isChecked ? 'IN:1' : 'IN:0')
                    }
                    className={styles.checkbox}
                />
            )}
            {valueType === 'DATE' && (
                <DatePicker
                    label={i18n.t('Date')}
                    value={value}
                    onChange={(date) => onChange(`${operator}:${date}`)}
                    className={styles.inputField}
                />
            )}
        </Fragment>
    )
}

FilterSelect.propTypes = {
    loadOptionSet: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    filter: PropTypes.string,
    optionSet: PropTypes.object,
    optionSets: PropTypes.object,
    valueType: PropTypes.string,
}

export default connect(
    (state) => ({
        optionSets: state.optionSets,
    }),
    { loadOptionSet }
)(FilterSelect)
