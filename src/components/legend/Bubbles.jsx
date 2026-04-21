import { scaleSqrt } from 'd3-scale'
import PropTypes from 'prop-types'
import React from 'react'
import { THEMATIC_RADIUS_DEFAULT } from '../../constants/layers.js'
import {
    createBubbleItems,
    createSingleColorBubbles,
    computeLayout,
} from '../../util/bubbles.js'
import Bubble from './Bubble.jsx'

const style = {
    paddingTop: 10,
}
export const digitWidth = 6.8
export const guideLength = 16
export const textPadding = 4

const Bubbles = ({
    radiusLow,
    radiusHigh,
    color,
    minValue,
    maxValue,
    classes,
    isPlugin,
    legendDecimalPlaces,
}) => {
    const legendWidth = isPlugin ? 150 : 245
    const noDataClass = classes.find((c) => c.noData === true)
    const isolatedClass = classes.find((c) => c.isLegendIsolated)
    const bubbleClasses = classes.filter(
        (c) => !c.noData && !c.isLegendIsolated
    )

    const height = radiusHigh * 2 + 4
    const scale = scaleSqrt().range([radiusLow, radiusHigh])

    if (Number.isNaN(radiusLow) || Number.isNaN(radiusHigh)) {
        return null
    }

    const bubbles = bubbleClasses.length
        ? createBubbleItems({
              classes: bubbleClasses,
              minValue,
              maxValue,
              scale,
              radiusHigh,
              legendDecimalPlaces,
          })
        : createSingleColorBubbles({
              color,
              minValue,
              maxValue,
              scale,
              radiusLow,
              radiusHigh,
              legendDecimalPlaces,
          })

    const { alternate, offset, showNumbers } = computeLayout({
        bubbles,
        bubbleClasses,
        radiusHigh,
        legendWidth,
    })

    if (showNumbers) {
        bubbles.forEach((b, i) => {
            if (!showNumbers.includes(i)) {
                delete b.text
            }
        })
    }

    const extraRowHeight = THEMATIC_RADIUS_DEFAULT * 2 + 4
    const tx = alternate ? offset : '2'

    return (
        <div style={style}>
            <svg
                width={legendWidth}
                height={
                    height +
                    20 +
                    (isolatedClass ? extraRowHeight : 0) +
                    (noDataClass ? THEMATIC_RADIUS_DEFAULT + 1 : 0)
                }
            >
                <g transform={`translate(${tx} 10)`}>
                    {bubbles.map((bubble, i) => (
                        <Bubble
                            key={i}
                            {...bubble}
                            textAlign={
                                alternate && i % 2 == 0 ? 'left' : 'right'
                            }
                        />
                    ))}
                </g>
                {isolatedClass && (
                    <>
                        <circle
                            transform={`translate(${tx} 20)`}
                            cx={radiusHigh}
                            cy={height}
                            r={THEMATIC_RADIUS_DEFAULT}
                            stroke="#000"
                            style={{
                                fill: isolatedClass.color,
                                strokeWidth: 0.5,
                            }}
                        />
                        <text
                            transform={`translate(${tx} 20)`}
                            x={radiusHigh + THEMATIC_RADIUS_DEFAULT + 5}
                            y={height + 4}
                            fontSize={12}
                        >
                            {isolatedClass.name}
                        </text>
                    </>
                )}
                {noDataClass && (
                    <>
                        <circle
                            transform={`translate(${tx} 20)`}
                            cx={radiusHigh}
                            cy={height + (isolatedClass ? extraRowHeight : 0)}
                            r={THEMATIC_RADIUS_DEFAULT}
                            stroke="#000"
                            style={{
                                fill: noDataClass.color,
                                strokeWidth: 0.5,
                            }}
                        />
                        <text
                            transform={`translate(${tx} 20)`}
                            x={radiusHigh + THEMATIC_RADIUS_DEFAULT + 5}
                            y={
                                height +
                                (isolatedClass ? extraRowHeight : 0) +
                                4
                            }
                            fontSize={12}
                        >
                            {noDataClass.name}
                        </text>
                    </>
                )}
            </svg>
        </div>
    )
}

Bubbles.propTypes = {
    radiusHigh: PropTypes.number.isRequired,
    radiusLow: PropTypes.number.isRequired,
    classes: PropTypes.array,
    color: PropTypes.string,
    isPlugin: PropTypes.bool,
    legendDecimalPlaces: PropTypes.number,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
}

export default Bubbles
