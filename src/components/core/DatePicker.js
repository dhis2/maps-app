import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { formatDate } from '../../util/time';

const styles = {
    root: {
        margin: '12px 0',
    },
};

// DatePicker not yet supported in Material-UI: https://github.com/mui-org/material-ui/issues/4787
// Fallback on browser native
const DatePicker = ({ label, value, onChange, classes, style }) => (
    <TextField
        type="date"
        label={label}
        defaultValue={formatDate(value)}
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
