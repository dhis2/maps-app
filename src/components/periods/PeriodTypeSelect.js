import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { periodTypes } from '../../constants/periods';

let periods;

const PeriodTypeSelect = ({ value, onChange, style, errorText }) => {
    if (!periods) {
        // Translate period names
        periods = periodTypes.map(({ id, name }) => ({
            id,
            name: i18next.t(name),
        }));
    }

    return (
        <SelectField
            label={i18next.t('Period type')}
            items={periods}
            value={value}
            onChange={onChange}
            style={style}
            errorText={!value && errorText ? errorText : null}
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
