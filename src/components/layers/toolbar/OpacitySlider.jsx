import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import styles from './styles/OpacitySlider.module.css'

const OpacitySlider = ({ opacity, disabled, onChange }) => {
    const lowerFill = `var(--colors-grey${disabled ? 400 : 600})`
    const upperFill = `var(--colors-grey${disabled ? 300 : 400})`

    const onSliderChange = useCallback(
        (evt) => onChange(Number(evt.target.value)),
        [onChange]
    )

    return (
        <div className={styles.container}>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                disabled={disabled}
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
    )
}

OpacitySlider.propTypes = {
    opacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default OpacitySlider
