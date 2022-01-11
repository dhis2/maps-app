import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/InputField.module.css';

const NumberField = ({
    label,
    value,
    min,
    max,
    step = 1,
    dense = true,
    disabled,
    onChange,
    className,
}) => (
    <div className={cx(styles.inputField, className)}>
        <InputField
            dense={dense}
            type="number"
            min={String(min)}
            max={String(max)}
            step={String(step)}
            label={label}
            value={Number.isNaN(value) ? '' : String(value)}
            disabled={disabled}
            onChange={({ value }) => onChange(value)}
        />
    </div>
);

NumberField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    dense: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default NumberField;
