import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../core/SelectField';
import { getRelativePeriods } from '../../constants/periods';

const RelativePeriodSelect = ({
    startEndDates,
    period,
    onChange,
    style,
    errorText,
}) => {
    const value = period ? period.id : null;

    const periods = useMemo(
        () =>
            (startEndDates
                ? [
                      {
                          id: 'START_END_DATES',
                          name: i18n.t('Start/end dates'),
                      },
                  ]
                : []
            ).concat(getRelativePeriods()),
        []
    );

    return (
        <SelectField
            label={i18n.t('Period')}
            items={periods}
            value={value}
            onChange={onChange}
            style={style}
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
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    errorText: PropTypes.string,
};

export default RelativePeriodSelect;
