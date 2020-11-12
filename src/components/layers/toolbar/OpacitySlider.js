import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles/OpacitySlider.module.css';

const OpacitySlider = ({ opacity, onChange }) => {
    const onSliderChange = useCallback(
        evt => onChange(Number(evt.target.value)),
        [onChange]
    );

    return (
        <div className={styles.container}>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={onSliderChange}
                className={styles.slider}
            />
        </div>
    );
};

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OpacitySlider;
