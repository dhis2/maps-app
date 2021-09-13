import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as UiCheckbox } from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/Checkbox.module.css';

// Wrapper around @dhis2/ui checkbox for unified handling and styling
const Checkbox = ({
    label,
    checked = false,
    disabled,
    dense = true,
    onChange,
    className,
}) => (
    <div className={cx(styles.checkbox, className)}>
        <UiCheckbox
            label={label}
            checked={checked}
            dense={dense}
            disabled={disabled}
            onChange={({ checked }) => onChange(checked)}
        />
    </div>
);

Checkbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default Checkbox;
