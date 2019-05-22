import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MuiCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Checkbox);
