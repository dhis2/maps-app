import { scaleSqrt } from 'd3-scale'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import styles from './styles/Bubbles.module.css'

export const digitWidth = 6.8
export const guideLength = 16
export const textPadding = 4
const LEGEND_WIDTH = 245

// --- Bubble layout helpers ---

const formatBubbleText = (bubbles, separator, decimalPlaces) =>
    bubbles.map((bubble) =>
        bubble.text === undefined
            ? bubble
            : {
                  ...bubble,
                  text: formatWithSeparator(bubble.text, separator, {
                      force: true,
                      precision: decimalPlaces,
                  }),
              }
    )

const filterBubbleText = (bubbles, showNumbers) =>
    showNumbers
        ? bubbles.map((bubble, i) =>
              showNumbers.includes(i) ? bubble : { ...bubble, text: undefined }
          )
        : bubbles

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
    const raw = bubbleClasses.length
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

    const formatted = formatBubbleText(
        raw,
        keyAnalysisDigitGroupSeparator,
        legendDecimalPlaces
    )
    const { alternate, offset, showNumbers } = computeLayout({
        bubbles: formatted,
        bubbleClasses,
        radiusHigh,
        legendWidth,
    })

    return {
        bubbles: filterBubbleText(formatted, showNumbers),
        alternate,
        offset,
    }
}

// --- Tooltip helpers (SVG label) ---

const capturePos = (el, zoom = 1) => {
    if (!el) {
        return null
    }
    const { top, left } = el.getBoundingClientRect()
    const fontSize = parseFloat(getComputedStyle(el).fontSize) * zoom
    return { top: top + fontSize * (1 - zoom) * 0.5, left, fontSize }
}

const makeTooltip = (pos, children) =>
    pos &&
    createPortal(
        <div
            className={styles.labelTooltip}
            style={{
                top: pos.top,
                left: pos.left,
                fontSize: `${pos.fontSize}px`,
                lineHeight: `${pos.fontSize * 1.25}px`,
            }}
        >
            {children}
        </div>,
        document.body
    )

// Shows only when the label is truncated
const useLabelTooltip = (label, displayLabel, { textRef, zoom }) => {
    const [pos, setPos] = useState(null)
    return {
        onMouseEnter: () => {
            if (displayLabel === label) {
                return
            }
            setPos(capturePos(textRef.current, zoom))
        },
        onMouseLeave: () => setPos(null),
        portal: makeTooltip(pos, label),
    }
}

// Measures and trims SVG text to fit within the available width
const useTruncatedSvgText = (label, count, availableWidth) => {
    const textRef = useRef(null)
    const [displayLabel, setDisplayLabel] = useState(label)

    useEffect(() => {
        const el = textRef.current
        if (!el || !label) {
            return
        }
        const countWidth =
            count === undefined ? 0 : `(${count})`.length * digitWidth + 8
        const labelMaxWidth = availableWidth - countWidth
        el.textContent = label
        if (el.getComputedTextLength() <= labelMaxWidth) {
            setDisplayLabel(label)
            return
        }
        let trimmed = label
        while (trimmed.length > 1) {
            el.textContent = trimmed + '…'
            if (el.getComputedTextLength() <= labelMaxWidth) {
                break
            }
            trimmed = trimmed.slice(0, -1)
        }
        setDisplayLabel(trimmed + '…')
    }, [label, count, availableWidth])

    return { textRef, displayLabel }
}

// --- SpecialClassRow ---

const SpecialClassRow = ({
    tx,
    ty,
    radiusHigh,
    cy,
    color,
    label,
    count,
    legendWidth,
    zoom,
}) => {
    const labelX = radiusHigh + THEMATIC_RADIUS_DEFAULT + 5
    const availableWidth = legendWidth - tx - labelX

    const { textRef, displayLabel } = useTruncatedSvgText(
        label,
        count,
        availableWidth
    )
    const labelTooltip = useLabelTooltip(label, displayLabel, { textRef, zoom })

    return (
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
                ref={textRef}
                transform={`translate(${tx} ${ty})`}
                x={labelX}
                y={cy + 4}
                fontSize={12}
                style={{
                    fill: 'var(--colors-grey900, #4a5568)',
                    pointerEvents: 'none',
                }}
            >
                {displayLabel}
            </text>
            <rect
                x={0}
                y={ty + cy - THEMATIC_RADIUS_DEFAULT - 2}
                width={legendWidth}
                height={THEMATIC_RADIUS_DEFAULT * 2 + 4}
                fill="transparent"
                style={{ cursor: 'default' }}
                onMouseEnter={labelTooltip.onMouseEnter}
                onMouseLeave={labelTooltip.onMouseLeave}
            />
            {count !== undefined && (
                <text
                    x={legendWidth - 4}
                    y={ty + cy + 4}
                    fontSize={12}
                    textAnchor="end"
                    style={{ fill: 'var(--colors-grey600, #9fa6b2)' }}
                >
                    {`(${count})`}
                </text>
            )}
            {labelTooltip.portal}
        </>
    )
}

SpecialClassRow.propTypes = {
    cy: PropTypes.number.isRequired,
    legendWidth: PropTypes.number.isRequired,
    radiusHigh: PropTypes.number.isRequired,
    tx: PropTypes.number.isRequired,
    ty: PropTypes.number.isRequired,
    color: PropTypes.string,
    count: PropTypes.number,
    label: PropTypes.string,
    zoom: PropTypes.number,
}

// --- Bubbles ---

const Bubbles = ({
    radiusLow,
    radiusHigh,
    color,
    minValue,
    maxValue,
    legendDecimalPlaces,
    classes,
    isPlugin = false,
}) => {
    const zoom = isPlugin ? 0.85 : 1
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
    const legendWidth = LEGEND_WIDTH

    const {
        bubbles = [],
        alternate = false,
        offset = 2,
    } = hasDataRange
        ? computeBubbleLayout({
              bubbleClasses,
              color,
              minValue,
              maxValue,
              scale: scaleSqrt().range([radiusLow, radiusHigh]),
              radiusLow,
              radiusHigh,
              legendWidth,
              legendDecimalPlaces,
              keyAnalysisDigitGroupSeparator,
          })
        : {}

    const tx = alternate ? offset : 2

    const isolatedLabel = isolatedClass
        ? isolatedClass.name ??
          formatRangeWithSeparator(
              isolatedClass,
              keyAnalysisDigitGroupSeparator,
              {
                  precision: legendDecimalPlaces,
              }
          )
        : null

    const specialClasses = [
        isolatedClass && {
            key: 'isolated',
            cy: yIsolated,
            fillColor: isolatedClass.color,
            label: isolatedLabel,
            count: isolatedClass.count,
        },
        unclassifiedClass && {
            key: 'unclassified',
            cy: yUnclassified,
            fillColor: unclassifiedClass.color,
            label: unclassifiedClass.name,
            count: unclassifiedClass.count,
        },
        noDataClass && {
            key: 'noData',
            cy: yNoData,
            fillColor: noDataClass.color,
            label: noDataClass.name,
            count: noDataClass.count,
        },
    ].filter(Boolean)

    return (
        <div>
            <svg width={legendWidth} height={legendHeight}>
                <g transform={`translate(${tx} ${ty})`}>
                    {bubbles.map((bubble, i) => (
                        <Bubble
                            key={i}
                            {...bubble}
                            textAlign={
                                alternate && i % 2 === 0 ? 'left' : 'right'
                            }
                        />
                    ))}
                </g>
                {specialClasses.map(({ key, cy, fillColor, label, count }) => (
                    <SpecialClassRow
                        key={key}
                        tx={tx}
                        ty={ty}
                        radiusHigh={radiusHigh}
                        cy={cy}
                        color={fillColor}
                        label={label}
                        count={count}
                        legendWidth={legendWidth}
                        zoom={zoom}
                    />
                ))}
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
