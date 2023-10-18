import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
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
        text: i18n.t('Clear sky'),
    },
    fair: {
        symbol: '02',
        text: i18n.t('Fair'),
    },
    partlycloudy: {
        symbol: '03',
        text: i18n.t('Partly cloudy'),
    },
    cloudy: {
        symbol: '04',
        text: i18n.t('Cloudy'),
    },
    lightrainshowers: {
        symbol: '40',
        text: i18n.t('Light rain showers'),
    },
    rainshowers: {
        symbol: '05',
        text: i18n.t('Rain showers'),
    },
    heavyrainshowers: {
        symbol: '41',
        text: i18n.t('Heavy rain showers'),
    },
    lightrainshowersandthunder: {
        symbol: '24',
        text: i18n.t('Light rain showers and thunder'),
    },
    rainshowersandthunder: {
        symbol: '06',
        text: i18n.t('Rain showers and thunder'),
    },
    heavyrainshowersandthunder: {
        symbol: '25',
        text: i18n.t('Heavy rain showers and thunder'),
    },
    lightsleetshowers: {
        symbol: '42',
        text: i18n.t('Light sleet showers'),
    },
    sleetshowers: {
        symbol: '07',
        text: i18n.t('Sleet showers'),
    },
    heavysleetshowers: {
        symbol: '43',
        text: i18n.t('Heavy sleet showers'),
    },
    lightsleetshowersandthunder: {
        symbol: '26',
        text: i18n.t('Light sleet showers and thunder'),
    },
    sleetshowersandthunder: {
        symbol: '20',
        text: i18n.t('Sleet showers and thunder'),
    },
    heavysleetshowersandthunder: {
        symbol: '27',
        text: i18n.t('Heavy sleet showers and thunder'),
    },
    lightsnowshowers: {
        symbol: '44',
        text: i18n.t('Light snow showers'),
    },
    snowshowers: {
        symbol: '08',
        text: i18n.t('Snow showers'),
    },
    heavysnowshowers: {
        symbol: '45',
        text: i18n.t('Heavy show showers'),
    },
    lightsnowshowersandthunder: {
        symbol: '28',
        text: i18n.t('Light snow showers and thunder'),
    },
    snowshowersandthunder: {
        symbol: '21',
        text: i18n.t('Snow showers and thunder'),
    },
    heavysnowshowersandthunder: {
        symbol: '29',
        text: i18n.t('Heavy snow showers and thunder'),
    },
    lightrain: {
        symbol: '46',
        text: i18n.t('Light rain'),
    },
    rain: {
        symbol: '09',
        text: i18n.t('Rain'),
    },
    heavyrain: {
        symbol: '10',
        text: i18n.t('Heavy rain'),
    },
    lightrainandthunder: {
        symbol: '30',
        text: i18n.t('Light rain and thunder'),
    },
    rainandthunder: {
        symbol: '22',
        text: i18n.t('Rain and thunder'),
    },
    heavyrainandthunder: {
        symbol: '11',
        text: i18n.t('Heavy rain and thunder'),
    },
    lightsleet: {
        symbol: '47',
        text: i18n.t('Light sleet'),
    },
    sleet: {
        symbol: '12',
        text: i18n.t('Sleet'),
    },
    heavysleet: {
        symbol: '48',
        text: i18n.t('Heavy sleet'),
    },
    lightsleetandthunder: {
        symbol: '31',
        text: i18n.t('Light sleet and thunder'),
    },
    sleetandthunder: {
        symbol: '23',
        text: i18n.t('Sleet and thunder'),
    },
    heavysleetandthunder: {
        symbol: '32',
        text: i18n.t('Heavy sleet and thunder'),
    },
    lightsnow: {
        symbol: '49',
        text: i18n.t('Light snow'),
    },
    snow: {
        symbol: '13',
        text: i18n.t('Snow'),
    },
    heavysnow: {
        symbol: '50',
        text: i18n.t('Heavy snow'),
    },
    lightsnowandthunder: {
        symbol: '33',
        text: i18n.t('Light snow and thunder'),
    },
    snowandthunder: {
        symbol: '14',
        text: i18n.t('Snow and thunder'),
    },
    heavysnowandthunder: {
        symbol: '34',
        text: i18n.t('Heavy snow and thunder'),
    },
    fog: {
        symbol: '15',
        text: i18n.t('Fog'),
    },
}

const WeatherSymbol = ({ code }) => {
    if (!code) {
        return <td></td>
    }
    const [image, specifier] = code.split('_')
    const { symbol, text } = symbols[image]

    const src = symbol + ({ day: 'd', night: 'n' }[specifier] || '')

    return (
        <td className={styles.symbol}>
            <img src={`/images/weather/${src}.png`} title={text} />
        </td>
    )
}

WeatherSymbol.propTypes = {
    code: PropTypes.string,
}

export default WeatherSymbol
