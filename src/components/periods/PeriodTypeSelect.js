import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { periodTypes } from '../../constants/periods';

let periods;

const PeriodTypeSelect = ({ value, onChange, style, errorText }) => {
    if (!periods) {
        // Translate period names
        periods = periodTypes.map(({ id, name }) => ({
            id,
            name: i18n.t(name),
        }));
    }

    return (
        <SelectField
            label={i18n.t('Period type')}
            items={periods}
            value={value}
            onChange={onChange}
            style={style}
            errorText={!value && errorText ? errorText : null}
            data-test="periodtypeselect"
        />
    );
};

PeriodTypeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    errorText: PropTypes.string,
};

export default PeriodTypeSelect;
