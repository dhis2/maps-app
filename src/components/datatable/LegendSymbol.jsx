import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/LegendSymbol.module.css'

// A legend class's icon or color, as the layer card shows it
const LegendSymbol = ({ iconUrl, color }) => {
    if (iconUrl) {
        return (
            <img
                className={styles.icon}
                src={iconUrl}
                alt=""
                onError={(e) => {
                    e.target.style.visibility = 'hidden'
                }}
            />
        )
    }
    if (color) {
        return (
            <span
                className={styles.swatch}
                style={{ backgroundColor: color }}
            />
        )
    }
    return null
}

LegendSymbol.propTypes = {
    color: PropTypes.string,
    iconUrl: PropTypes.string,
}

export default LegendSymbol
