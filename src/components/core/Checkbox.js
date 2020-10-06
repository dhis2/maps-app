import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as UiCheckbox } from '@dhis2/ui';

// Wrapper around @dhis2/ui checkbox for unified handling and styling
const Checkbox = ({ label, checked = false, disabled, onChange, style }) => (
    <div style={{ padding: 10, ...style }}>
        <UiCheckbox
            label={label}
            checked={checked}
            disabled={disabled}
            onChange={({ checked }) => onChange(checked)}
        />
    </div>
);

Checkbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    disabled: PropTypes.bool,
};

export default Checkbox;
