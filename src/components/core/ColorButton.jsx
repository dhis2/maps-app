import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/ColorButton.module.css'

const ColorButton = ({ color, onChange, className }) => (
    <label
        className={cx(styles.colorButton, className)}
        style={{
            backgroundImage: `radial-gradient(
                        circle, ${color} 35%, transparent 40%
                    )`,
        }}
    >
        <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
    </label>
)

ColorButton.propTypes = {
    color: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
}

export default ColorButton
