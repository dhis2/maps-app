import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '@dhis2/ui';
import cx from 'classnames';
import styles from './styles/InputField.module.css';

// Wrapper component around @dhis2/ui InputField
const TextField = ({ type, label, value, onChange, className }) => (
    <div className={cx(styles.inputField, className)}>
        <InputField
            type={type}
            label={label}
            value={value}
            onChange={({ value }) => onChange(value)}
        />
    </div>
);

TextField.propTypes = {
    type: PropTypes.string,
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default TextField;
