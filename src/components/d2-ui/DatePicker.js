import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%Y-%m-%d');

// DatePicker not yet supported in Material-UI: https://github.com/mui-org/material-ui/issues/4787
const DatePicker = ({ label, value, onChange, style, textFieldStyle }) => (
    <TextField
        type="date"
        label={label}
        value={value && value !== 'undefined' ? new Date(value) : null}
        // className={classes.textField}
        // InputLabelProps={{
        //    shrink: true,
        //}}
    />
);

/*
<MuiDatePicker
floatingLabelText={label}
onChange={(event, date) => onChange(formatTime(date))}
value={value && value !== 'undefined' ? new Date(value) : null}
style={style}
textFieldStyle={textFieldStyle}
/>
*/

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    textFieldStyle: PropTypes.object,
    classes: PropTypes.object.isRequired,
};

export default DatePicker;
