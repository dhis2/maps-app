import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiDatePicker from 'material-ui/DatePicker';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat("%Y-%m-%d");

const textFieldStyle = {
    width: '100%',
};

const DatePicker = ({ label, value, onChange, style }) => {
    return (
        <MuiDatePicker
            floatingLabelText={label}
            onChange={(event, date) => onChange(formatTime(date))}
            value={value && value !== 'undefined' ? new Date(value) : null}
            style={style}
            textFieldStyle={textFieldStyle} // Make responsive
        />
    );
};

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default DatePicker;
