import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useRef, useEffect } from 'react'
import styles from './styles/WeatherSymbol.module.css'

/**
 * Mapping of the symbol code in yr.no's API to the icons in their public
 * GitHub repo, as well as the text used in the tooltip.
 *
 * https://api.met.no/weatherapi/weathericon/2.0/documentation
 */
const symbols = {
    clearsky: {
        symbol: '01',
        text: 'Clear sky',
    },
    fair: {
        symbol: '02',
        text: 'Fair',
    },
    partlycloudy: {
        symbol: '03',
        text: 'Partly cloudy',
    },
    cloudy: {
        symbol: '04',
        text: 'Cloudy',
    },
    lightrainshowers: {
        symbol: '40',
        text: 'Light rain showers',
    },
    rainshowers: {
        symbol: '05',
        text: 'Rain showers',
    },
    heavyrainshowers: {
        symbol: '41',
        text: 'Heavy rain showers',
    },
    lightrainshowersandthunder: {
        symbol: '24',
        text: 'Light rain showers and thunder',
    },
    rainshowersandthunder: {
        symbol: '06',
        text: 'Rain showers and thunder',
    },
    heavyrainshowersandthunder: {
        symbol: '25',
        text: 'Heavy rain showers and thunder',
    },
    lightsleetshowers: {
        symbol: '42',
        text: 'Light sleet showers',
    },
    sleetshowers: {
        symbol: '07',
        text: 'Sleet showers',
    },
    heavysleetshowers: {
        symbol: '43',
        text: 'Heavy sleet showers',
    },
    lightsleetshowersandthunder: {
        symbol: '26',
        text: 'Light sleet showers and thunder',
    },
    sleetshowersandthunder: {
        symbol: '20',
        text: 'Sleet showers and thunder',
    },
    heavysleetshowersandthunder: {
        symbol: '27',
        text: 'Heavy sleet showers and thunder',
    },
    lightsnowshowers: {
        symbol: '44',
        text: 'Light snow showers',
    },
    snowshowers: {
        symbol: '08',
        text: 'Snow showers',
    },
    heavysnowshowers: {
        symbol: '45',
        text: 'Heavy show showers',
    },
    lightsnowshowersandthunder: {
        symbol: '28',
        text: 'Light snow showers and thunder',
    },
    snowshowersandthunder: {
        symbol: '21',
        text: 'Snow showers and thunder',
    },
    heavysnowshowersandthunder: {
        symbol: '29',
        text: 'Heavy snow showers and thunder',
    },
    lightrain: {
        symbol: '46',
        text: 'Light rain',
    },
    rain: {
        symbol: '09',
        text: 'Rain',
    },
    heavyrain: {
        symbol: '10',
        text: 'Heavy rain',
    },
    lightrainandthunder: {
        symbol: '30',
        text: 'Light rain and thunder',
    },
    rainandthunder: {
        symbol: '22',
        text: 'Rain and thunder',
    },
    heavyrainandthunder: {
        symbol: '11',
        text: 'Heavy rain and thunder',
    },
    lightsleet: {
        symbol: '47',
        text: 'Light sleet',
    },
    sleet: {
        symbol: '12',
        text: 'Sleet',
    },
    heavysleet: {
        symbol: '48',
        text: 'Heavy sleet',
    },
    lightsleetandthunder: {
        symbol: '31',
        text: 'Light sleet and thunder',
    },
    sleetandthunder: {
        symbol: '23',
        text: 'Sleet and thunder',
    },
    heavysleetandthunder: {
        symbol: '32',
        text: 'Heavy sleet and thunder',
    },
    lightsnow: {
        symbol: '49',
        text: 'Light snow',
    },
    snow: {
        symbol: '13',
        text: 'Snow',
    },
    heavysnow: {
        symbol: '50',
        text: 'Heavy snow',
    },
    lightsnowandthunder: {
        symbol: '33',
        text: 'Light snow and thunder',
    },
    snowandthunder: {
        symbol: '14',
        text: 'Snow and thunder',
    },
    heavysnowandthunder: {
        symbol: '34',
        text: 'Heavy snow and thunder',
    },
    fog: {
        symbol: '15',
        text: 'Fog',
    },
}

const WeatherSymbol = ({ code }) => {
    if (!code) {
        return <td></td>
    }
    const [image, specifier] = code.split('_')
    const src =
        symbols[image].symbol + ({ day: 'd', night: 'n' }[specifier] || '')

    return (
        <td className={styles.symbol}>
            <img src={`/images/weather/${src}.png`} />
        </td>
    )
}

export default WeatherSymbol
