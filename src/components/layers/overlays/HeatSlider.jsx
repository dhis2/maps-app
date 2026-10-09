import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import styles from './styles/HeatSlider.module.css'

const HeatSlider = ({ heat, disabled, onChange }) => {
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
                value={heat}
                disabled={disabled}
                onChange={onSliderChange}
                className={styles.slider}
                style={{
                    background: `linear-gradient(
                        to right,
                        ${lowerFill} 0%,
                        ${lowerFill} ${heat * 100}%,
                        ${upperFill} ${heat * 100}%,
                        ${upperFill} 100%
                    )`,
                }}
            />
        </div>
    )
}

HeatSlider.propTypes = {
    heat: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}

export default HeatSlider
