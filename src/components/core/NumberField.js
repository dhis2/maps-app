import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import styles from './styles/InputField.module.css';

// Wrapper component around @dhis2/ui InputField
const NumberField = ({ label, onChange, style }) => (
    <div className={styles.inputField} style={style}>
        <InputField
            type="number"
            label={label}
            onChange={({ value }) => onChange(value)}
        />
    </div>
);

NumberField.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
};

export default NumberField;
