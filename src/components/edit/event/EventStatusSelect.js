import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import SelectField from '../../core/SelectField';
import { getEventStatuses } from '../../../constants/eventStatuses';

const EventStatusSelect = props => {
    const { value = 'ALL', onChange, style } = props;

    return (
        <SelectField
            label={i18n.t('Event status')}
            items={getEventStatuses()}
            value={value}
            onChange={valueType => onChange(valueType.id)}
            style={style}
        />
    );
};

EventStatusSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default EventStatusSelect;
