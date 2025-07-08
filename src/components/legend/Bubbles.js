import i18n from '@dhis2/d2-i18n'
import { precisionRound } from 'd3-format'
import { scaleSqrt } from 'd3-scale'
import PropTypes from 'prop-types'
import React from 'react'
import { THEMATIC_RADIUS_DEFAULT } from '../../constants/layers.js'
import { getContrastColor } from '../../util/colors.js'
import { getLongestTextLength } from '../../util/helpers.js'
import { getRoundToPrecisionFn } from '../../util/numbers.js'
import Bubble from './Bubble.js'

const style = {
    paddingTop: 10,
}

const digitWidth = 6.8
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
}) => {
    const legendWidth = !isPlugin ? 245 : 150
    const noDataClass = classes.find((c) => c.noData === true)
    const bubbleClasses = classes.filter((c) => !c.noData)

    const binSize = (maxValue - minValue) / (bubbleClasses.length || 3)
    const precision = precisionRound(binSize, maxValue)
    const valueFormat = (n) => getRoundToPrecisionFn(precision)(n).toString()

    const height = radiusHigh * 2 + 4
    const scale = scaleSqrt().range([radiusLow, radiusHigh])

    if (isNaN(radiusLow) || isNaN(radiusHigh)) {
        return null
    }

    let bubbles = []

    // If color legend
    if (bubbleClasses.length) {
        const startValue = bubbleClasses[0].startValue
        const endValue = bubbleClasses[bubbleClasses.length - 1].endValue
        const itemScale = scale.domain([startValue, endValue])

        bubbles = [...bubbleClasses].reverse().map((c) => ({
            radius: itemScale(c.endValue),
            maxRadius: radiusHigh,
            color: c.color,
            text: valueFormat(c.endValue),
        }))

        // Add the smallest bubble for the lowest value
        bubbles.push({
            radius: itemScale(startValue),
            maxRadius: radiusHigh,
            text: valueFormat(startValue),
        })
    } else {
        // If single color
        const stroke = color && getContrastColor(color)
        const itemScale = scale.domain([minValue, maxValue])
        const midValue = (maxValue + minValue) / 2
        const radiusMid = itemScale(midValue)

        bubbles = [
            {
                radius: radiusHigh,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: valueFormat(maxValue) || i18n.t('Max'),
            },
            {
                radius: radiusMid,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: valueFormat(midValue) || i18n.t('Mid'),
            },
            {
                radius: radiusLow,
                maxRadius: radiusHigh,
                color,
                stroke,
                text: valueFormat(minValue) || i18n.t('Min'),
            },
        ]
    }

    // Calculate the pixel length of the longest number
    let textLength = Math.ceil(
        Math.max(
            getLongestTextLength(bubbleClasses, 'startValue'),
            getLongestTextLength(bubbleClasses, 'endValue')
        ) * digitWidth
    )

    // Calculate the total length if numbers are alternate on each side
    const alternateLength =
        (radiusHigh + guideLength + textPadding + textLength) * 2

    let smallestGap = bubbles.reduce((prev, curr, i) => {
        const gap = prev.radius - curr.radius
        const smallestGap =
            prev.gap === undefined || gap < prev.gap ? gap : prev.gap

        return i === bubbles.length - 1
            ? Math.round(smallestGap * 2)
            : {
                  radius: curr.radius,
                  gap: smallestGap,
              }
    })

    const alternateFit = alternateLength < legendWidth

    const alternate = alternateFit && smallestGap > 5 && smallestGap < 12

    if (!alternateFit) {
        smallestGap = smallestGap / 2
    }

    // Too cramped to show number for each bubble
    if (smallestGap < 6) {
        const [maxBubble] = bubbles
        const minBubble = bubbles[bubbles.length - 1]
        const gap = maxBubble.radius - minBubble.radius
        const showNumbers = [0] // Always show largest number

        if (gap > 6) {
            showNumbers.push(bubbles.length - 1)
        }

        if (gap > 15) {
            const midRadius = minBubble.radius + gap / 2

            // Find the closest bubble above the mid radius
            const midBubble = bubbles.reduce((prev, curr) =>
                curr.radius >= midRadius &&
                curr.radius - midRadius < prev.radius - midRadius
                    ? curr
                    : prev
            )

            showNumbers.push(bubbles.indexOf(midBubble))
        }

        bubbles.forEach((b, i) => {
            if (!showNumbers.includes(i)) {
                delete b.text
            }
        })
    }

    textLength = Math.ceil(getLongestTextLength(bubbles, 'text') * digitWidth)

    const offset = textLength + guideLength + textPadding

    return (
        <div style={style}>
            <svg
                width={legendWidth}
                height={
                    height +
                    20 +
                    (noDataClass ? THEMATIC_RADIUS_DEFAULT + 1 : 0)
                }
            >
                <g transform={`translate(${alternate ? offset : '2'} 10)`}>
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
                {noDataClass && (
                    <>
                        {' '}
                        <circle
                            transform={`translate(${
                                alternate ? offset : '2'
                            } 20)`}
                            cx={radiusHigh}
                            cy={height}
                            r={THEMATIC_RADIUS_DEFAULT}
                            stroke="#000"
                            style={{
                                fill: noDataClass.color,
                                strokeWidth: 0.5,
                            }}
                        />
                        <text
                            transform={`translate(${
                                alternate ? offset : '2'
                            } 20)`}
                            x={radiusHigh + THEMATIC_RADIUS_DEFAULT + 5}
                            y={height + 4}
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
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
}

export default Bubbles
