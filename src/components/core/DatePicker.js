import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%Y-%m-%d');

// DatePicker not yet supported in Material-UI: https://github.com/mui-org/material-ui/issues/4787
const DatePicker = ({ label, value, onChange, style, textFieldStyle }) => (
    <TextField
        type="date"
        label={label}
        defaultValue={value}
        onChange={event => onChange(event.target.value)}
        style={style}
        // InputLabelProps={{
        //    shrink: true,
        //}}
    />
);


DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    // value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    textFieldStyle: PropTypes.object,
    // classes: PropTypes.object.isRequired,
};

export default DatePicker;
