import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import styles from './styles/PastWeather.module.css'

const PastWeather = ({ geometry }) => {
    return <div>Past Weather</div>
}

PastWeather.propTypes = {
    geometry: PropTypes.object.isRequired,
}

export default PastWeather
