import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import styles from './styles/InputField.module.css';

// Adds support for min/max values for @dhis2/ui InputField
const NumberField = ({ label, value, min, max, onChange, style }) => {
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
        <div className={styles.inputField} style={style}>
            <InputField
                type="number"
                label={label}
                value={String(value)}
                onChange={onNumberChange}
            />
        </div>
    );
};

NumberField.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default NumberField;
