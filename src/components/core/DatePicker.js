import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import { formatDate } from '../../util/time';
import styles from './styles/DatePicker.module.css';

// DatePicker not yet supported in @dhis2/ui
// Fallback on browser native
const DatePicker = ({ label, value, onChange, style }) => (
    <div className={styles.datePicker} style={style}>
        <InputField
            type="date"
            label={label}
            value={formatDate(value)}
            onChange={({ value }) => onChange(value)}
        />
    </div>
);

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default DatePicker;
