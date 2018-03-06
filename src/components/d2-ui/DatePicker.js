import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MuiDatePicker from 'material-ui/DatePicker';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%Y-%m-%d');

const DatePicker = ({ label, value, onChange, style, textFieldStyle }) => (
    <MuiDatePicker
        floatingLabelText={label}
        onChange={(event, date) => onChange(formatTime(date))}
        value={value && value !== 'undefined' ? new Date(value) : null}
        style={style}
        textFieldStyle={textFieldStyle}
    />
);

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    textFieldStyle: PropTypes.object,
};

export default DatePicker;
