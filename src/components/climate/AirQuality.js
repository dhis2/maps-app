import PropTypes from 'prop-types'
import React from 'react'

// https://developers.google.com/earth-engine/datasets/catalog/ECMWF_CAMS_NRT
// https://atmosphere.copernicus.eu/
const AirQuality = ({ geometry }) => {
    console.log('AirQuality', geometry)
    return <div>Air quality</div>
}

AirQuality.propTypes = {
    geometry: PropTypes.object.isRequired,
}

export default AirQuality
