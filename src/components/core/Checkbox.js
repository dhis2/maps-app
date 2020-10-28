import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Checkbox as MuiCheckbox, FormControlLabel } from '@material-ui/core';

const styles = {
    root: {
        margin: '12px 0',
    },
};

// Wrapper around MUI Checkbox with label support
const Checkbox = ({
    label,
    checked = false,
    onCheck,
    disabled,
    classes,
    className,
    style,
}) => (
    <FormControlLabel
        label={label}
        control={
            <MuiCheckbox
                color="primary"
                checked={checked}
                onChange={(event, isChecked) => onCheck(isChecked)}
                disabled={disabled}
            />
        }
        classes={classes}
        className={className}
        style={style}
    />
);

Checkbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onCheck: PropTypes.func.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
    iconStyle: PropTypes.object,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Checkbox);
