import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import WeatherSymbol from './WeatherSymbol'
import styles from './styles/DayForecast.module.css'

const hours = ['00', '06', '12', '18']

const DayForecast = ({ date, series }) => {
    const day = new Date(date).toDateString().slice(0, -5)
    const temp = series.map((s) => s.data.instant.details.air_temperature)
    const minTemp = Math.round(Math.min(...temp))
    const maxTemp = Math.round(Math.max(...temp))
    const sixHours = hours.map((t) => `${date}T${t}:00:00Z`)

    const weatherSymbols = sixHours.map((t) => (
        <WeatherSymbol
            key={t}
            code={
                series.find((s) => s.time === t)?.data?.next_6_hours?.summary
                    ?.symbol_code
            }
        />
    ))

    const sixHourSeries = series.filter((s) => sixHours.includes(s.time))

    // TODO: Not the same as yr.no the first day
    const precip = sixHourSeries.reduce((p, { data }) => {
        const value = data?.next_6_hours?.details?.precipitation_amount
        return p + (value !== undefined ? value : 0)
    }, 0)

    const wind = series.map((s) => s.data.instant.details.wind_speed)
    const maxWind = Math.round(Math.max(...wind))

    return (
        <tr>
            <td className={styles.day}>{day}</td>
            {weatherSymbols}
            <td className={styles.temp}>
                {maxTemp}° / {minTemp}°
            </td>
            <td className={styles.precip}>{Math.round(precip * 10) / 10} mm</td>
            <td className={styles.wind}>{maxWind} m/s</td>
        </tr>
    )
}

export default DayForecast
