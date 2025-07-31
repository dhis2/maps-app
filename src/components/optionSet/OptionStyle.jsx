import PropTypes from 'prop-types'
import React from 'react'
import { ColorPicker } from '../core/index.js'
import styles from './styles/OptionStyle.module.css'

const OptionStyle = ({ name, color, onChange }) => (
    <div className={styles.item}>
        <ColorPicker
            color={color}
            onChange={onChange}
            className={styles.color}
        />
        <span className={styles.label}>{name}</span>
    </div>
)

OptionStyle.propTypes = {
    color: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default OptionStyle
