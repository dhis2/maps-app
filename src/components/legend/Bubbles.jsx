import { scaleSqrt } from 'd3-scale'
import PropTypes from 'prop-types'
import React from 'react'
import { THEMATIC_RADIUS_DEFAULT } from '../../constants/layers.js'
import {
    createBubbleItems,
    createSingleColorBubbles,
    computeLayout,
} from '../../util/bubbles.js'
import { formatWithSeparator } from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import Bubble from './Bubble.jsx'

const style = {
    paddingTop: 10,
}
export const digitWidth = 6.8
export const guideLength = 16
export const textPadding = 4

const filterBubbleText = (bubbles, showNumbers) => {
    if (!showNumbers) {
        return
    }
    bubbles.forEach((b, i) => {
        if (!showNumbers.includes(i)) {
            delete b.text
        }
    })
}

const computeBubbleLayout = ({
    bubbleClasses,
    color,
    minValue,
    maxValue,
    scale,
    radiusLow,
    radiusHigh,
    legendWidth,
}) => {
    const bubbles = bubbleClasses.length
        ? createBubbleItems({
              classes: bubbleClasses,
              minValue,
              maxValue,
              scale,
              radiusHigh,
          })
        : createSingleColorBubbles({
              color,
              minValue,
              maxValue,
              scale,
              radiusLow,
              radiusHigh,
          })

    const layout = computeLayout({
        bubbles,
        bubbleClasses,
        radiusHigh,
        legendWidth,
    })
    filterBubbleText(bubbles, layout.showNumbers)

    return { bubbles, alternate: layout.alternate, offset: layout.offset }
}

const Bubbles = ({
    radiusLow,
    radiusHigh,
    color,
    minValue,
    maxValue,
    legendDecimalPlaces,
    classes,
    isPlugin,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const legendWidth = isPlugin ? 150 : 245
    const noDataClass = classes.find((c) => c.noData === true)
    const bubbleClasses = classes.filter((c) => !c.noData)
    const hasDataRange = minValue != null && maxValue != null
    const height = hasDataRange
        ? radiusHigh * 2 + 4
        : THEMATIC_RADIUS_DEFAULT + 2
    const scale = scaleSqrt().range([radiusLow, radiusHigh])
    const noDataTranslateY = hasDataRange ? 20 : 0

    if (isNaN(radiusLow) || isNaN(radiusHigh)) {
        return null
    }

    if (!hasDataRange && !noDataClass) {
        return null
    }

    let bubbles = []
    let alternate = false
    let offset = '2'

    if (hasDataRange) {
        ;({ bubbles, alternate, offset } = computeBubbleLayout({
            bubbleClasses,
            color,
            minValue,
            maxValue,
            scale,
            radiusLow,
            radiusHigh,
            legendWidth,
        }))

        bubbles.forEach((bubble) => {
            if (bubble.text !== undefined) {
                bubble.text = formatWithSeparator(
                    bubble.text,
                    keyAnalysisDigitGroupSeparator,
                    {
                        force: true,
                        precision: legendDecimalPlaces,
                    }
                )
            }
        })
    }

    const xTranslate = alternate ? offset : '2'

    return (
        <div style={style}>
            <svg
                width={legendWidth}
                height={
                    hasDataRange
                        ? height +
                          20 +
                          (noDataClass ? THEMATIC_RADIUS_DEFAULT + 1 : 0)
                        : 20
                }
            >
                <g transform={`translate(${xTranslate} 10)`}>
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
                            transform={`translate(${xTranslate} ${noDataTranslateY})`}
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
                            transform={`translate(${xTranslate} ${noDataTranslateY})`}
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
    legendDecimalPlaces: PropTypes.number,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
}

export default Bubbles
