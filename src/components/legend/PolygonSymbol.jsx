import PropTypes from 'prop-types'
import React from 'react'

const PolygonSymbol = ({ color, fill = 'none', weight }) => (
    <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
        <path
            fill={fill}
            stroke={color}
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M 3.5 18.5 l 7.5 2.5 l 11 -2 L 19 12 l 3 -4 l -8 -3 l -8 2 L 2 14 z"
        />
    </svg>
)

PolygonSymbol.propTypes = {
    color: PropTypes.string,
    fill: PropTypes.string,
    weight: PropTypes.number,
}

export default PolygonSymbol
