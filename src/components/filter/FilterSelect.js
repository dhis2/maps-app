import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import TextField from '../core/TextField';
import Checkbox from '../core/Checkbox';
import DatePicker from '../core/DatePicker';
import OptionSetSelect from '../optionSet/OptionSetSelect';
import { loadOptionSet } from '../../actions/optionSets';
import { numberValueTypes, textValueTypes } from '../../constants/valueTypes';

const styles = {
    operator: {
        float: 'left',
        marginRight: 24,
        width: 'calc((100% - 48px) / 8 * 2)',
    },
    textField: {
        float: 'left',
        width: 'calc((100% - 48px) / 8 * 3)',
    },
    datePicker: {
        width: 165,
    },
};

export class FilterSelect extends Component {
    static propTypes = {
        valueType: PropTypes.string.isRequired,
        filter: PropTypes.string,
        optionSet: PropTypes.object,
        optionSets: PropTypes.object,
        loadOptionSet: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.loadOptionSet();
    }

    componentDidUpdate() {
        this.loadOptionSet();
    }

    render() {
        const {
            valueType,
            filter,
            optionSet,
            optionSets,
            onChange,
        } = this.props;

        const operators = this.getOperators(valueType, optionSet);
        let operator;
        let value;

        if (filter) {
            const splitFilter = filter.split(':');
            operator = splitFilter[0];
            value = splitFilter[1];
        } else if (operators) {
            operator = operators[0].id;
        }

        return [
            operators ? (
                <SelectField
                    key="operator"
                    label={i18n.t('Operator')}
                    items={operators}
                    value={operator}
                    onChange={newOperator =>
                        onChange(`${newOperator.id}:${value ? value : ''}`)
                    }
                    style={styles.operator}
                />
            ) : null,
            optionSet && optionSets[optionSet.id] ? (
                <OptionSetSelect
                    key="optionset"
                    options={optionSets[optionSet.id].options}
                    value={value ? value.split(';') : null}
                    onChange={newValue =>
                        onChange(`${operator}:${newValue.join(';')}`)
                    }
                    style={styles.textField}
                />
            ) : null,
            numberValueTypes.includes(valueType) ? (
                <TextField
                    id="number"
                    key="number"
                    label={i18n.t('Value')}
                    type="number"
                    value={value !== undefined ? value : ''}
                    onChange={newValue => onChange(`${operator}:${newValue}`)}
                    style={styles.textField}
                />
            ) : null,
            textValueTypes.includes(valueType) && !optionSet ? (
                <TextField
                    key="text"
                    label={i18n.t('Value')}
                    value={value || ''}
                    onChange={newValue => onChange(`${operator}:${newValue}`)}
                    style={styles.textField}
                />
            ) : null,
            valueType === 'BOOLEAN' ? (
                <Checkbox
                    key="checkbox"
                    label={i18n.t('Yes')}
                    checked={value == 1 ? true : false}
                    onCheck={isChecked => onChange(isChecked ? 'IN:1' : 'IN:0')}
                />
            ) : null,
            valueType === 'DATE' ? (
                <DatePicker
                    key="date"
                    label={i18n.t('Date')}
                    value={value}
                    onChange={date => onChange(`${operator}:${date}`)}
                    style={styles.datePicker}
                />
            ) : null,
        ];
    }

    getOperators(valueType, optionSet) {
        let operators;

        if (
            ['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'DATE'].includes(
                valueType
            )
        ) {
            operators = [
                { id: 'EQ', name: '=' },
                { id: 'GT', name: '>' },
                { id: 'GE', name: '>=' },
                { id: 'LT', name: '<' },
                { id: 'LE', name: '<=' },
                { id: 'NE', name: '!=' },
            ];
        } else if (optionSet) {
            operators = [
                { id: 'IN', name: i18n.t('one of') },
                { id: '!IN', name: i18n.t('not one of') },
            ];
        } else if (textValueTypes.includes(valueType)) {
            operators = [
                { id: 'LIKE', name: i18n.t('contains') },
                { id: '!LIKE', name: i18n.t("doesn't contains") },
                { id: 'EQ', name: i18n.t('is') },
                { id: '!EQ', name: i18n.t('is not') },
            ];
        }

        return operators;
    }

    loadOptionSet() {
        const { optionSet, optionSets, loadOptionSet } = this.props;

        if (optionSet && !optionSets[optionSet.id]) {
            loadOptionSet(optionSet.id);
        }
    }
}

export default connect(
    state => ({
        optionSets: state.optionSets,
    }),
    { loadOptionSet }
)(FilterSelect);
