import React from 'react';
import PropTypes from 'prop-types';
import MuiCheckbox from 'material-ui/Checkbox';

const Checkbox = ({ label, checked, onCheck, style, labelStyle, iconStyle }) => (
    <MuiCheckbox
        label={label}
        checked={checked}
        onCheck={(event, isChecked) => onCheck(isChecked)}
        style={style}
        labelStyle={labelStyle}
        iconStyle={iconStyle}
    />
);

Checkbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onCheck: PropTypes.func.isRequired,
    style: PropTypes.object,
    labelStyle: PropTypes.object,
    iconStyle: PropTypes.object,
};

export default Checkbox;
