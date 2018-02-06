import React, { Component } from 'react';
import i18next from 'i18next';
import SelectField from 'd2-ui/lib/select-field/SelectField';
import { createPeriodGeneratorsForLocale } from 'd2/lib/period/generators'

// TODO: Add locale for period generator
const periodGenerator = createPeriodGeneratorsForLocale();

const PeriodSelect = ({ periodType, period, onChange, style, errorText }) => {
    const value = period ? period.id : null;
    const generator = periodGenerator[`generate${periodType}PeriodsForYear`] || periodGenerator[`generate${periodType}PeriodsUpToYear`];

    if(!generator) {
        return null;
    }

    const periods = generator().reverse();

    return (
        <SelectField
            label={i18next.t('Period')}
            items={periods}
            value={value}
            onChange={onChange}
            style={style}
            errorText={!value && errorText ? errorText : null}
        />
    );
};

export default PeriodSelect;
