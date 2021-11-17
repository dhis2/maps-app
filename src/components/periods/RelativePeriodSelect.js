import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../core';
import { getRelativePeriods } from '../../util/periods';
import { START_END_DATES } from '../../constants/periods';

const RelativePeriodSelect = ({
    startEndDates,
    period,
    hiddenPeriods,
    onChange,
    className,
    errorText,
}) => {
    const periods = useMemo(
        () =>
            (startEndDates
                ? [
                      {
                          id: START_END_DATES,
                          name: i18n.t('Start/end dates'),
                      },
                  ]
                : []
            ).concat(getRelativePeriods(hiddenPeriods)),
        []
    );

    const value =
        period && periods.find(p => p.id === period.id) ? period.id : null;

    return (
        <SelectField
            label={i18n.t('Period')}
            items={periods}
            value={value}
            onChange={onChange}
            className={className}
            errorText={!value && errorText ? errorText : null}
        />
    );
};

RelativePeriodSelect.propTypes = {
    startEndDates: PropTypes.bool,
    period: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
    hiddenPeriods: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    errorText: PropTypes.string,
};

export default RelativePeriodSelect;
