import PropTypes from 'prop-types'
import React from 'react'

const AirQuality = ({ geometry }) => {
    console.log('AirQuality', geometry)
    return <div>Air quality</div>
}

AirQuality.propTypes = {
    geometry: PropTypes.object.isRequired,
}

export default AirQuality
