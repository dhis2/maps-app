import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import DayForecast from './DayForecast'
import styles from './styles/Forecast.module.css'

// Freetown:
// https://www.yr.no/en/forecast/daily-table/2-2409306/Sierra%20Leone/Western%20Area/Freetown
const Forecast = ({ geometry }) => {
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
        return <div>{i18n.t('Loading weather data')}...</div>
    }

    const { timeseries } = data.properties
    const dates = timeseries.reduce((acc, { time }) => {
        const date = time.slice(0, 10)
        if (!acc.includes(date)) {
            acc.push(date)
        }
        return acc
    }, [])

    return (
        <>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <td></td>
                        <td>{i18n.t('Night')}</td>
                        <td>{i18n.t('Morning')}</td>
                        <td>{i18n.t('Afternoon')}</td>
                        <td>{i18n.t('Evening')}</td>
                        <td className={styles.right}>
                            {i18n.t('Max/min temp.')}
                        </td>
                        <td className={styles.right}>{i18n.t('Precip.')}</td>
                        <td className={styles.right}>{i18n.t('Wind')}</td>
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
            <div className={styles.source}>
                Data from <a href="https://api.met.no">MET Norway</a> and{' '}
                <a href="https://www.ecmwf.int/en/forecasts/datasets/set-i">
                    ECMWF HRES
                </a>
            </div>
        </>
    )
}

Forecast.propTypes = {
    geometry: PropTypes.object.isRequired,
}

export default Forecast
