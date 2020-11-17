import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './styles/OpacitySlider.module.css';

const lowerFill = 'var(--colors-grey800)';
const upperFill = 'var(--colors-grey400)';

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
                style={{
                    background: `linear-gradient(
                        to right,
                        ${lowerFill} 0%,
                        ${lowerFill} ${opacity * 100}%,
                        ${upperFill} ${opacity * 100}%,
                        ${upperFill} 100%
                    )`,
                }}
            />
        </div>
    );
};

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default OpacitySlider;
