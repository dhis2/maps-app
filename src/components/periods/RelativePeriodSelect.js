import React from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { SelectField } from '@dhis2/d2-ui-core';
import { relativePeriods } from '../../constants/periods';

let periods;

const RelativePeriodSelect = ({
    startEndDates,
    period,
    onChange,
    style,
    errorText,
}) => {
    const value = period ? period.id : null;

    if (!periods) {
        // Create periods array on first run
        periods = (startEndDates
            ? [
                  {
                      // Used in event layer dialog
                      id: 'START_END_DATES',
                      name: 'Start/end dates',
                  },
              ]
            : []
        )
            .concat(relativePeriods)
            .map(({ id, name }) => ({
                id,
                name: i18next.t(name), // Translate period names
            }));
    }

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
