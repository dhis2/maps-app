import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'i18next';
import TextField from 'd2-ui/lib/text-field/TextField';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import Checkbox from 'material-ui/Checkbox';
import OptionSetSelect from '../optionSet/OptionSetSelect';
import DatePicker from '../d2-ui/DatePicker';
import { loadOptionSet } from '../../actions/optionSets';

const styles = {
    operator: {
        float: 'left',
        top: -8,
        marginRight: 24,
        width: 'calc((100% - 48px) / 8 * 2)',
    },
    textField: {
        float: 'left',
        top: -8,
        width: 'calc((100% - 48px) / 8 * 3)',
    },
    checkbox: {
        float: 'left',
        marginTop: 26,
        marginLeft: -4,
        width: 'calc((100% - 48px) / 8 * 5)',
    },
    dateField: {
        width: 'calc((100% - 48px) / 8 * 3)',
        top: -8,
    },
};

// https://react.rocks/example/react-redux-test
// https://docs.dhis2.org/master/en/developer/html/webapi_metadata_object_filter.html

/* Value Types: https://play.dhis2.org/demo/api/schemas/dataElement
- TEXT
- LONG_TEXT
- LETTER
- PHONE_NUMBER
- EMAIL
- BOOLEAN
- TRUE_ONLY
- DATE
- DATETIME
- TIME
- NUMBER
- UNIT_INTERVAL
- PERCENTAGE
- INTEGER
- INTEGER_POSITIVE
- INTEGER_NEGATIVE
- INTEGER_ZERO_OR_POSITIVE
- TRACKER_ASSOCIATE
- USERNAME
- FILE_RESOURCE
- COORDINATE
- ORGANISATION_UNIT
- AGE
- URL
*/


const FilterSelect = ({ valueType, filter, optionSet, optionSets, loadOptionSet, onChange }) => {
    let operators;
    let operator;
    let value;

    if (['NUMBER', 'INTEGER', 'INTEGER_POSITIVE', 'DATE'].includes(valueType)) {
        operators = [
            { id: 'EQ', name: '=' },
            { id: 'GT', name: '>' },
            { id: 'GE', name: '>=' },
            { id: 'LT', name: '<' },
            { id: 'LE', name: '<=' },
            { id: 'NE', name: '!=' }
        ];
    } else if (optionSet) {
        operators = [
            { id: 'IN', name: i18next.t('one of') },
            { id: '!IN', name: i18next.t('not one of') },
        ];
    } else if (['TEXT', 'LONG_TEXT'].includes(valueType)) {
        operators = [
            { id: 'LIKE', name: i18next.t('contains') },
            { id: '!LIKE', name: i18next.t('doesn\'t contains') },
            { id: 'EQ', name: i18next.t('is') },
            { id: '!EQ', name: i18next.t('is not') },
        ];
    }

    if (optionSet && !optionSets[optionSet.id]) {
        loadOptionSet(optionSet.id);
    }

    if (filter) {
        const splitFilter = filter.split(':');
        operator = splitFilter[0];
        value = splitFilter[1];
    } else if (operators) {
        operator = operators[0].id;
    }

    // console.log('valueType', valueType);

    return [
        (operators ?
            <SelectField
                key='operator'
                label={i18next.t('Operator')}
                items={operators}
                value={operator}
                onChange={newOperator => onChange(`${newOperator.id}:${value ? value : ''}`)}
                style={styles.operator}
            />
        : null),

        (optionSet && optionSets[optionSet.id] ?
            <OptionSetSelect
                key='optionset'
                options={optionSets[optionSet.id].options}
                value={value ? value.split(';') : null}
                onChange={newValue => onChange(`${operator}:${newValue.join(';')}`)}
                style={styles.textField}
            />
        : null),

        (['NUMBER', 'INTEGER', 'INTEGER_POSITIVE'].includes(valueType) ?
            <TextField
                key='number'
                label={i18next.t('Value')}
                type='number'
                value={value}
                onChange={newValue => onChange(`${operator}:${newValue}`)}
                style={styles.textField}
            />
        : null),

        (['TEXT', 'LONG_TEXT'].includes(valueType) && !optionSet ?
            <TextField
                key='text'
                label={i18next.t('Value')}
                value={value || ''}
                onChange={newValue => onChange(`${operator}:${newValue}`)}
                style={styles.textField}
            />
        : null),

        (valueType === 'BOOLEAN' ?
            <Checkbox
                key='checkbox'
                label={i18next.t('Yes')}
                checked={value == 1 ? true : false}
                onCheck={(event, isChecked) => onChange(isChecked ? 'IN:1' : 'IN:0' )}
                style={styles.checkbox}
            />
        : null),

        (valueType === 'DATE' ?
            <DatePicker
                key='date'
                label={i18next.t('Date')}
                value={value}
                onChange={(date) => onChange(`${operator}:${date}`)}
                style={styles.datePicker}
                textFieldStyle={styles.dateField}
            />
        : null)
    ];
};

export default connect(
    (state) => ({
        optionSets: state.optionSets,
    }),
    { loadOptionSet }
)(FilterSelect);
