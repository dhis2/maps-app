import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import { SelectField } from '../../core';
import { getEventStatuses } from '../../../constants/eventStatuses';

const EventStatusSelect = ({ value = 'ALL', onChange, className }) => (
    <SelectField
        label={i18n.t('Event status')}
        items={getEventStatuses()}
        value={value}
        onChange={valueType => onChange(valueType.id)}
        className={className}
    />
);

EventStatusSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default EventStatusSelect;
