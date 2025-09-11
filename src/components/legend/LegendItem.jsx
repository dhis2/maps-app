import PropTypes from 'prop-types'
import React from 'react'
import LegendItemRange from './LegendItemRange.jsx'
import LineSymbol from './LineSymbol.jsx'
import PolygonSymbol from './PolygonSymbol.jsx'
import styles from './styles/LegendItem.module.css'

const maxRadius = 15
const maxLineWeight = 5

const LegendItem = ({
    type,
    image,
    color,
    strokeColor,
    fillColor,
    radius,
    weight,
    name,
    startValue,
    endValue,
    count,
}) => {
    if (!name && startValue === undefined) {
        return null
    }

    const symbol = {
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundColor: color ? color : 'transparent',
    }

    if (strokeColor) {
        symbol.border = `1px solid ${strokeColor}`
    }

    if (radius) {
        const r = Math.min(radius, maxRadius) * 2

        symbol.width = `${r}px`
        symbol.height = `${r}px`
        symbol.borderRadius = '50%'
    }

    const lineWeight = weight ? Math.min(weight, maxLineWeight) : null

    return (
        <tr className={styles.legendItem} data-test="layerlegend-item">
            <th>
                {weight ? (
                    type === 'LineString' ? (
                        <LineSymbol color={color} weight={lineWeight} />
                    ) : (
                        <PolygonSymbol
                            color={strokeColor || color}
                            fill={fillColor}
                            weight={lineWeight}
                        />
                    )
                ) : (
                    <span style={symbol} />
                )}
            </th>
            <LegendItemRange
                name={name}
                startValue={startValue}
                endValue={endValue}
                count={count}
            />
        </tr>
    )
}

LegendItem.propTypes = {
    color: PropTypes.string,
    count: PropTypes.number,
    endValue: PropTypes.number,
    fillColor: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    radius: PropTypes.number,
    startValue: PropTypes.number,
    strokeColor: PropTypes.string,
    type: PropTypes.string,
    weight: PropTypes.number,
}

export default LegendItem
