import PropTypes from 'prop-types'
import React from 'react'

// Drawn as layers draw them on the map: a dot, a line, an area with an outline
const DOT = { fill: 'currentColor' }
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 }
const AREA = {
    fill: 'currentColor',
    fillOpacity: 0.3,
    stroke: 'currentColor',
    strokeWidth: 1.5,
}

const SYMBOLS = {
    Point: [DOT, <circle key="a" cx="8" cy="8" r="4.5" />],
    MultiPoint: [
        DOT,
        <circle key="a" cx="5" cy="10.5" r="3.5" />,
        <circle key="b" cx="11.5" cy="5" r="3" />,
    ],
    LineString: [LINE, <path key="a" d="M1.5 12.5 6 7l3.5 3.5 5-7" />],
    MultiLineString: [
        LINE,
        <path key="a" d="M1.5 9.5 5 5.5l3 3" />,
        <path key="b" d="M8.5 14.5l3-4 3 1.5" />,
    ],
    Polygon: [
        AREA,
        <path key="a" d="M2 5.5 7.5 2l6.5 3-1.5 8L4.5 14 1.5 9.5z" />,
    ],
    MultiPolygon: [
        AREA,
        <path key="a" d="M1.5 4 5 1.5 8 3.5 7 8 2.5 8z" />,
        <path key="b" d="M9 9.5l4-1.5 1.5 4-3.5 2.5-2.5-1.5z" />,
    ],
}

// A small drawing of a GeoJSON geometry type, nothing for other types
const GeometrySymbol = ({ type, className }) => {
    if (!Object.hasOwn(SYMBOLS, type)) {
        return null
    }
    const [drawing, ...shapes] = SYMBOLS[type]
    return (
        <svg
            className={className}
            viewBox="0 0 16 16"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-test="geometry-symbol"
            {...drawing}
        >
            {shapes}
        </svg>
    )
}

GeometrySymbol.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
}

export default GeometrySymbol
