import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { timeFormat } from 'd3-time-format';

const formatTime = timeFormat('%Y-%m-%d');

const styles = {
    root: {
        margin: '12px 0',
    },
};

// react-dom.development.js:3337 The specified value "2018-10-17T00:00:00.000" does not conform to the required format, "yyyy-MM-dd".

// DatePicker not yet supported in Material-UI: https://github.com/mui-org/material-ui/issues/4787
// Fallback on browser native
const DatePicker = ({ label, value, onChange, classes, style }) => (
    <TextField
        type="date"
        label={label}
        defaultValue={formatTime(new Date(value))}
        onChange={event => onChange(event.target.value)}
        style={style}
        classes={classes}
        InputLabelProps={{
            shrink: true,
        }}
    />
);

DatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    style: PropTypes.object,
};

export default withStyles(styles)(DatePicker);
