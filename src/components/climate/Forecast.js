import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import Meteogram from './util/Meteogram'

const Forecast = ({ name, geometry }) => {
    const [data, setData] = useState()
    const chartRef = useRef()

    const [lng, lat] = geometry.coordinates

    // https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=8.41633815756606&lon=-11.667823791503906

    useEffect(() => {
        fetch(
            `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`
        )
            .then((response) => response.json())
            .then(setData)
    }, [lng, lat])

    useEffect(() => {
        if (data && chartRef.current) {
            const meteogram = new Meteogram(data, chartRef.current)
        }
    }, [data, chartRef])

    return (
        <div ref={chartRef} style={{ width: '800px' }}>
            Forecast
        </div>
    )
}

export default Forecast
