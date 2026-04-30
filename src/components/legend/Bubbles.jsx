import { scaleSqrt } from 'd3-scale'
import PropTypes from 'prop-types'
import React from 'react'
import { THEMATIC_RADIUS_DEFAULT } from '../../constants/layers.js'
import {
    createBubbleItems,
    createSingleColorBubbles,
    computeLayout,
} from '../../util/bubbles.js'
import {
    formatRangeWithSeparator,
    formatWithSeparator,
} from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import Bubble from './Bubble.jsx'

const style = {
    paddingTop: 10,
}
export const digitWidth = 6.8
export const guideLength = 16
export const textPadding = 4

const formatBubbleText = (
    bubbles,
    keyAnalysisDigitGroupSeparator,
    legendDecimalPlaces
) => {
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

const filterBubbleText = (bubbles, showNumbers) => {
    if (!showNumbers) {
        return
    }
    bubbles.forEach((bubble, i) => {
        if (!showNumbers.includes(i)) {
            delete bubble.text
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
    legendDecimalPlaces,
    keyAnalysisDigitGroupSeparator,
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

    formatBubbleText(
        bubbles,
        keyAnalysisDigitGroupSeparator,
        legendDecimalPlaces
    )

    const layout = computeLayout({
        bubbles,
        bubbleClasses,
        radiusHigh,
        legendWidth,
    })

    filterBubbleText(bubbles, layout.showNumbers)

    return { bubbles, alternate: layout.alternate, offset: layout.offset }
}

const SpecialClassRow = ({ tx, ty, radiusHigh, cy, color, label, count }) => (
    <>
        <circle
            transform={`translate(${tx} ${ty})`}
            cx={radiusHigh}
            cy={cy}
            r={THEMATIC_RADIUS_DEFAULT}
            stroke="#000"
            style={{ fill: color, strokeWidth: 0.5 }}
        />
        <text
            transform={`translate(${tx} ${ty})`}
            x={radiusHigh + THEMATIC_RADIUS_DEFAULT + 5}
            y={cy + 4}
            fontSize={12}
        >
            {label}
            {count !== undefined && ` (${count})`}
        </text>
    </>
)

SpecialClassRow.propTypes = {
    cy: PropTypes.number.isRequired,
    radiusHigh: PropTypes.number.isRequired,
    tx: PropTypes.number.isRequired,
    ty: PropTypes.number.isRequired,
    color: PropTypes.string,
    count: PropTypes.number,
    label: PropTypes.string,
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

    const noDataClass = classes.find((c) => c.isNoData)
    const isolatedClass = classes.find((c) => c.isIsolated)
    const unclassifiedClass = classes.find((c) => c.isUnclassified)
    const bubbleClasses = classes.filter(
        (c) => !c.isNoData && !c.isIsolated && !c.isUnclassified
    )

    const hasDataRange = minValue != null && maxValue != null
    if (!hasDataRange && !noDataClass && !isolatedClass && !unclassifiedClass) {
        return null
    }
    if (Number.isNaN(radiusLow) || Number.isNaN(radiusHigh)) {
        return null
    }

    const mainRowHeight = radiusHigh * 2
    const extraRowHeight = THEMATIC_RADIUS_DEFAULT * 2 + 4
    const ty = 10

    const yIsolated = hasDataRange ? mainRowHeight + extraRowHeight : 0
    const yUnclassified = yIsolated + (isolatedClass ? extraRowHeight : 0)
    const yNoData = yUnclassified + (unclassifiedClass ? extraRowHeight : 0)

    const legendHeight = yNoData + ty + THEMATIC_RADIUS_DEFAULT + 2
    const legendWidth = isPlugin ? 150 : 245

    let bubbles = []
    let alternate = false
    let offset = 2

    if (hasDataRange) {
        const scale = scaleSqrt().range([radiusLow, radiusHigh])
        ;({ bubbles, alternate, offset } = computeBubbleLayout({
            bubbleClasses,
            color,
            minValue,
            maxValue,
            scale,
            radiusLow,
            radiusHigh,
            legendWidth,
            legendDecimalPlaces,
            keyAnalysisDigitGroupSeparator,
        }))
    }
    const tx = alternate ? offset : 2

    const isolatedLabel = isolatedClass
        ? isolatedClass.name ??
          formatRangeWithSeparator(
              isolatedClass,
              keyAnalysisDigitGroupSeparator,
              { precision: legendDecimalPlaces }
          )
        : null

    return (
        <div style={style}>
            <svg width={legendWidth} height={legendHeight}>
                <g transform={`translate(${tx} ${ty})`}>
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
                    <SpecialClassRow
                        tx={tx}
                        ty={ty}
                        radiusHigh={radiusHigh}
                        cy={yIsolated}
                        color={isolatedClass.color}
                        label={isolatedLabel}
                        count={isolatedClass.count}
                    />
                )}
                {unclassifiedClass && (
                    <SpecialClassRow
                        tx={tx}
                        ty={ty}
                        radiusHigh={radiusHigh}
                        cy={yUnclassified}
                        color={unclassifiedClass.color}
                        label={unclassifiedClass.name}
                        count={unclassifiedClass.count}
                    />
                )}
                {noDataClass && (
                    <SpecialClassRow
                        tx={tx}
                        ty={ty}
                        radiusHigh={radiusHigh}
                        cy={yNoData}
                        color={noDataClass.color}
                        label={noDataClass.name}
                        count={noDataClass.count}
                    />
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
