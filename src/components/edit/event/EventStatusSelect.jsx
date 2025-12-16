import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import {
    getEventStatuses,
    EVENT_STATUS_ALL,
} from '../../../constants/eventStatuses.js'
import { SelectField } from '../../core/index.js'

const EventStatusSelect = ({
    value = EVENT_STATUS_ALL,
    onChange,
    className,
}) => (
    <SelectField
        label={i18n.t('Event status')}
        items={getEventStatuses()}
        value={value}
        onChange={(valueType) => onChange(valueType.id)}
        className={className}
    />
)

EventStatusSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    value: PropTypes.string,
}

export default EventStatusSelect
