import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import cx from 'classnames';
import { formatDate } from '../../util/time';
import styles from './styles/DatePicker.module.css';

// DatePicker not yet supported in @dhis2/ui
// Fallback on browser native
const DatePicker = ({ label, value, dense = true, onChange, className }) => (
    <div className={cx(styles.datePicker, className)}>
        <InputField
            dense={dense}
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
    dense: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default DatePicker;
