import React, { Component } from 'react';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { relativePeriods } from '../../constants/periods';

let periods;

const RelativePeriodSelect = ({ startEndDates, period, onChange, style }) => {
    if (!periods) { // Create periods array on first run
        periods = (startEndDates ? [{ // Used in event layer dialog
            id: 'START_END_DATES',
            name: 'Start/end dates',
        }] : []).concat(relativePeriods).map(period => ({
            id: period.id,
            name: i18next.t(period.name), // Translate period names
        }));
    }

    return (
        <SelectField
            label={i18next.t('Period')}
            items={periods}
            value={period && period.id}
            onChange={onChange}
            style={style}
        />
    );
}

export default RelativePeriodSelect;
