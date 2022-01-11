import React from 'react';
import PropTypes from 'prop-types';
import { ColorPicker } from '../core';
import styles from './styles/OptionStyle.module.css';

const OptionStyle = ({ name, color, onChange }) => (
    <div className={styles.item}>
        <ColorPicker
            color={color}
            onChange={onChange}
            className={styles.color}
        />
        <span className={styles.label}>{name}</span>
    </div>
);

OptionStyle.propTypes = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OptionStyle;
