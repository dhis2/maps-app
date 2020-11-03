import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import NumberField from '../core/NumberField';
import TextField from '../core/TextField';
import Checkbox from '../core/Checkbox';
import DatePicker from '../core/DatePicker';
import OptionSetSelect from '../optionSet/OptionSetSelect';
import { loadOptionSet } from '../../actions/optionSets';
import {
    numberValueTypes,
    textValueTypes,
    booleanValueTypes,
} from '../../constants/valueTypes';
import styles from './styles/FilterSelect.module.css';

const getOperators = (valueType, optionSet) => {
    let operators;

    if (['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'DATE'].includes(valueType)) {
        operators = [
            { id: 'EQ', name: '=' },
            { id: 'GT', name: '>' },
            { id: 'GE', name: '>=' },
            { id: 'LT', name: '<' },
            { id: 'LE', name: '<=' },
            { id: 'NE', name: '!=' },
        ];
    } else if (optionSet) {
        operators = [{ id: 'IN', name: i18n.t('one of') }];
    } else if (textValueTypes.includes(valueType)) {
        operators = [
            { id: 'LIKE', name: i18n.t('contains') },
            { id: 'EQ', name: i18n.t('is') },
            { id: 'NE', name: i18n.t('is not') },
        ];
    }

    return operators;
};

const FilterSelect = ({
    valueType,
    filter,
    optionSet,
    optionSets,
    onChange,
    loadOptionSet,
}) => {
    const operators = getOperators(valueType, optionSet);
    let operator;
    let value;

    if (filter) {
        const splitFilter = filter.split(':');
        operator = splitFilter[0];
        value = splitFilter[1];
    } else if (operators) {
        operator = operators[0].id;
    }

    useEffect(() => {
        if (optionSet && !optionSets[optionSet.id]) {
            loadOptionSet(optionSet.id);
        }
    }, [optionSet, optionSets, loadOptionSet]);

    return (
        <Fragment>
            {operators && (
                <SelectField
                    key="operator"
                    label={i18n.t('Operator')}
                    items={operators}
                    value={operator}
                    onChange={newOperator =>
                        onChange(`${newOperator.id}:${value ? value : ''}`)
                    }
                    className={styles.operator}
                />
            )}
            {optionSet && optionSets[optionSet.id] && (
                <OptionSetSelect
                    key="optionset"
                    options={optionSets[optionSet.id].options}
                    value={value ? value.split(';') : null}
                    onChange={newValue =>
                        onChange(`${operator}:${newValue.join(';')}`)
                    }
                    className={styles.inputField}
                />
            )}
            {numberValueTypes.includes(valueType) && (
                <NumberField
                    key="number"
                    label={i18n.t('Value')}
                    value={value !== undefined ? value : ''}
                    onChange={newValue => onChange(`${operator}:${newValue}`)}
                    className={styles.inputField}
                />
            )}
            {textValueTypes.includes(valueType) && !optionSet && (
                <TextField
                    key="text"
                    label={i18n.t('Value')}
                    value={value || ''}
                    onChange={newValue => onChange(`${operator}:${newValue}`)}
                    className={styles.inputField}
                />
            )}
            {booleanValueTypes.includes(valueType) && (
                <Checkbox
                    key="checkbox"
                    label={i18n.t('Yes')}
                    checked={value == 1 ? true : false}
                    onChange={isChecked =>
                        onChange(isChecked ? 'IN:1' : 'IN:0')
                    }
                />
            )}
            {valueType === 'DATE' && (
                <DatePicker
                    key="date"
                    label={i18n.t('Date')}
                    value={value}
                    onChange={date => onChange(`${operator}:${date}`)}
                    className={styles.inputField}
                />
            )}
        </Fragment>
    );
};

FilterSelect.propTypes = {
    valueType: PropTypes.string,
    filter: PropTypes.string,
    optionSet: PropTypes.object,
    optionSets: PropTypes.object,
    loadOptionSet: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        optionSets: state.optionSets,
    }),
    { loadOptionSet }
)(FilterSelect);
