import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/TemperatureValue.module.css'

const TemperatureValue = ({ value }) => (
    <span className={styles[value > 0 ? 'plus' : 'minus']}>{value}°</span>
)

TemperatureValue.propTypes = {
    value: PropTypes.number.isRequired,
}

export default TemperatureValue
