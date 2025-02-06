import PropTypes from 'prop-types'
import React from 'react'

const LineSymbol = ({ color, weight }) => (
    <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
        <path
            stroke={color}
            fill={color}
            strokeWidth={weight / 2}
            d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"
        />
    </svg>
)

LineSymbol.propTypes = {
    color: PropTypes.string,
    weight: PropTypes.number,
}

export default LineSymbol
