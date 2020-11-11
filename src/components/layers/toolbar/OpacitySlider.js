import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from '@material-ui/core';
import styles from './styles/OpacitySlider.module.css';

const OpacitySlider = ({ opacity, onChange }) => (
    <div className={styles.slider}>
        <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(evt, opacity) => onChange(opacity)}
        />
    </div>
);

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OpacitySlider;
