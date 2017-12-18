import React, { Component } from 'react';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { periodTypes } from '../../constants/periods';

let periods;

const PeriodTypeSelect = (props) => {

    if (!periods) { // Translate period names
        periods = periodTypes.map(period => ({
            id: period.id,
            name: i18next.t(period.name),
        }));
    }

    return (
        <SelectField
            label={i18next.t('Period type')}
            items={periods}
            {...props}
        />
    );
};

export default PeriodTypeSelect;