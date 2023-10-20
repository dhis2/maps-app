import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { getAirQuality } from '../../util/earthEngine.js'

// https://medium.com/google-earth/monitoring-air-quality-with-s5p-tropomi-data-4f6b0aebe1c0
// https://medium.com/google-earth/how-nasa-and-google-are-teaming-up-to-understand-and-analyze-air-quality-around-the-world-7c89f6efad3d
// https://www.nature.com/articles/s41598-023-34774-9
// https://www.mdpi.com/2673-4672/3/2/19
// Sentinel-5: https://developers.google.com/earth-engine/datasets/tags/air-quality
// https://developers.google.com/earth-engine/datasets/catalog/ECMWF_CAMS_NRT
// https://atmosphere.copernicus.eu/
// https://forum.atmospherictoolbox.org/t/convert-the-unit-from-molecules-m-2-to-ppm/154/2
// https://www.youtube.com/watch?v=OvDVb_-BDPk
// https://www.mdpi.com/2673-4672/3/2/19
const AirQuality = ({ geometry }) => {
    const [data, setData] = useState()

    console.log('AirQuality', data)

    useEffect(() => {
        getAirQuality(geometry).then(setData)
    }, [geometry])

    useEffect(() => {
        if (data) {
            // const test = idToDate(data[0].id)
            console.log('data', data)
        }
    }, [data])

    return <div>Air quality</div>
}

AirQuality.propTypes = {
    geometry: PropTypes.object.isRequired,
}

export default AirQuality
