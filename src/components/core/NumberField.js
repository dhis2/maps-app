import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/InputField.module.css';

// Adds support for min/max values for @dhis2/ui InputField
const NumberField = ({
    label,
    value,
    min,
    max,
    dense = true,
    onChange,
    className,
}) => {
    const onNumberChange = useCallback(
        ({ value }) => {
            if (
                (min === undefined || value >= min) &&
                (max === undefined || value <= max)
            ) {
                onChange(value);
            }
        },
        [min, max]
    );

    return (
        <div className={cx(styles.inputField, className)}>
            <InputField
                dense={dense}
                type="number"
                label={label}
                value={String(value)}
                onChange={onNumberChange}
            />
        </div>
    );
};

NumberField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    min: PropTypes.number,
    max: PropTypes.number,
    dense: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default NumberField;
