import React from 'react';
import PropTypes from 'prop-types';
import MuiCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const Checkbox = ({
    label,
    checked,
    onCheck,
    style,
    labelStyle,
    iconStyle,
    disabled,
}) => (
    <FormControlLabel
        label={label}
        control={
            <MuiCheckbox
                label={label}
                checked={checked}
                onChange={(event, isChecked) => onCheck(isChecked)}
                // style={style}
                // labelStyle={labelStyle}
                // iconStyle={iconStyle}
                disabled={disabled}
            />
        }
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
};

export default Checkbox;
