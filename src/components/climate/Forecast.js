import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import DayForecast from './DayForecast'
import styles from './styles/Forecast.module.css'

const formatDate = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}-${month}-${day}`
}

// Freetown:
// https://www.yr.no/en/forecast/daily-table/2-2409306/Sierra%20Leone/Western%20Area/Freetown
const Forecast = ({ name, geometry }) => {
    const [data, setData] = useState()

    const [lng, lat] = geometry.coordinates

    useEffect(() => {
        fetch(
            `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lng}`
        )
            .then((response) => response.json())
            .then(setData)
    }, [lng, lat])

    if (!data) {
        return <div>Loading...</div>
    }

    const { timeseries } = data.properties
    const dates = timeseries.reduce((acc, { time }) => {
        const date = time.slice(0, 10)
        if (!acc.includes(date)) {
            acc.push(date)
        }
        return acc
    }, [])

    // console.log(timeseries)

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <td></td>
                    <td>Night</td>
                    <td>Morning</td>
                    <td>Afternoon</td>
                    <td>Evening</td>
                    <td className={styles.right}>Max/min temp.</td>
                    <td className={styles.right}>Precip.</td>
                    <td className={styles.right}>Wind</td>
                </tr>
            </thead>
            <tbody>
                {dates.map((date) => (
                    <DayForecast
                        key={date}
                        date={date}
                        series={timeseries.filter((t) =>
                            t.time.startsWith(date)
                        )}
                    />
                ))}
            </tbody>
        </table>
    )
}

export default Forecast
