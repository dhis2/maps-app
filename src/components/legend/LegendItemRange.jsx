import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    formatCompact,
    formatCount,
    formatWithSeparator,
    getCompactScale,
} from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/LegendItemRange.module.css'

// --- Tooltip infrastructure ---

const captureTooltipPos = (el, zoom = 1) => {
    if (!el) {
        return null
    }
    const rect = el.getBoundingClientRect()
    const computed = getComputedStyle(el)
    const lineHeight = Number.parseFloat(computed.lineHeight) * zoom
    return {
        top: rect.top + (rect.height - lineHeight) / 2,
        left: rect.left,
        color: computed.color,
        fontSize: Number.parseFloat(computed.fontSize) * zoom,
        lineHeight,
        paddingLeft: Number.parseFloat(computed.paddingLeft) * zoom,
    }
}

const makePortalTooltip = (pos, className, children) =>
    pos &&
    createPortal(
        <div
            className={className}
            style={{
                top: pos.top,
                left: pos.left,
                color: pos.color,
                fontSize: `${pos.fontSize}px`,
                lineHeight: `${pos.lineHeight}px`,
                paddingLeft: `${pos.paddingLeft}px`,
            }}
        >
            {children}
        </div>,
        document.body
    )

const tooltipCx = (specificClass) => cx(styles.legendTooltip, specificClass)

// Shows only when the element overflows (truncated name)
const useNameTooltip = (name, zoom) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    return {
        ref,
        onMouseEnter: () => {
            const el = ref.current
            if (el && el.scrollWidth > el.offsetWidth) {
                setPos(captureTooltipPos(el, zoom))
            }
        },
        onMouseLeave: () => setPos(null),
        portal: makePortalTooltip(pos, styles.legendTooltip, name),
    }
}

// Shows on hover when the value is compacted (scale != null)
const useValueTooltip = (content, className, { scale, zoom }) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    const show = scale
        ? () => setPos(captureTooltipPos(ref.current, zoom))
        : undefined
    const hide = scale ? () => setPos(null) : undefined
    return {
        ref: scale ? ref : undefined,
        onClick: show,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        portal: makePortalTooltip(pos, className, content),
    }
}

// --- RangeCells ---

// Range cells (start – end) with overflow-safe portal tooltips
const RangeCells = ({
    displayStart,
    displayEnd,
    startScale,
    endScale,
    startValue,
    endValue,
    keyAnalysisDigitGroupSeparator,
    opts,
    zoom,
}) => {
    const rangeTooltipClass = tooltipCx(styles.legendRangeTooltip)
    const startTooltip = useValueTooltip(
        formatWithSeparator(startValue, keyAnalysisDigitGroupSeparator, opts),
        rangeTooltipClass,
        { scale: startScale, zoom }
    )
    const endTooltip = useValueTooltip(
        formatWithSeparator(endValue, keyAnalysisDigitGroupSeparator, opts),
        rangeTooltipClass,
        { scale: endScale, zoom }
    )

    return (
        <>
            <td className={styles.legendStart}>
                {startScale ? (
                    <button
                        ref={startTooltip.ref}
                        type="button"
                        className={styles.legendValueButton}
                        onClick={startTooltip.onClick}
                        onMouseEnter={startTooltip.onMouseEnter}
                        onMouseLeave={startTooltip.onMouseLeave}
                        onFocus={startTooltip.onFocus}
                        onBlur={startTooltip.onBlur}
                    >
                        {displayStart}
                    </button>
                ) : (
                    displayStart
                )}
                {startTooltip.portal}
            </td>
            <td className={styles.legendDash}>{'–'}</td>
            <td className={styles.legendEnd}>
                {endScale ? (
                    <button
                        ref={endTooltip.ref}
                        type="button"
                        className={styles.legendValueButton}
                        onClick={endTooltip.onClick}
                        onMouseEnter={endTooltip.onMouseEnter}
                        onMouseLeave={endTooltip.onMouseLeave}
                        onFocus={endTooltip.onFocus}
                        onBlur={endTooltip.onBlur}
                    >
                        {displayEnd}
                    </button>
                ) : (
                    displayEnd
                )}
                {endTooltip.portal}
            </td>
        </>
    )
}

RangeCells.propTypes = {
    displayEnd: PropTypes.string,
    displayStart: PropTypes.string,
    endScale: PropTypes.object,
    endValue: PropTypes.number,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    opts: PropTypes.object,
    startScale: PropTypes.object,
    startValue: PropTypes.number,
    zoom: PropTypes.number,
}

// --- Render helpers ---

// Open-bound items ("< min" / "> max"): one value aligned to start or end column
const renderOpenBound = ({
    tooltip,
    displayValue,
    scale,
    countCell,
    atEnd,
}) => {
    const valueCell = scale ? (
        <button
            ref={tooltip.ref}
            type="button"
            className={styles.legendValueButton}
            onClick={tooltip.onClick}
            onMouseEnter={tooltip.onMouseEnter}
            onMouseLeave={tooltip.onMouseLeave}
            onFocus={tooltip.onFocus}
            onBlur={tooltip.onBlur}
        >
            {displayValue}
        </button>
    ) : (
        displayValue
    )
    return (
        <>
            <td className={styles.legendNameEmpty} style={{ width: 0 }}></td>
            <td style={{ width: 0 }}></td>
            <td className={styles.legendStart}>{atEnd ? null : valueCell}</td>
            <td className={styles.legendDash}></td>
            <td className={styles.legendEnd}>{atEnd ? valueCell : null}</td>
            <td className={styles.legendSpacer}></td>
            {countCell}
            {tooltip.portal}
        </>
    )
}

// Category items, special classes (no data, unclassified): name only, no range columns
const renderNameOnly = ({ nameTooltip, name, countCell, hasCount }) => (
    <>
        <td
            ref={nameTooltip.ref}
            colSpan={hasCount ? 6 : 5}
            className={styles.legendItemRange}
            onMouseEnter={name ? nameTooltip.onMouseEnter : undefined}
            onMouseLeave={name ? nameTooltip.onMouseLeave : undefined}
        >
            {name || null}
        </td>
        {countCell}
        {nameTooltip.portal}
    </>
)

// Numeric range without a label
const renderRangeOnly = ({ rangeProps, countCell }) => (
    <>
        <td className={styles.legendNameEmpty} style={{ width: 0 }}></td>
        <td style={{ width: 0 }}></td>
        <RangeCells {...rangeProps} />
        <td className={styles.legendSpacer}></td>
        {countCell}
    </>
)

// Name alongside range: name is width-constrained to leave room for the values
const renderNameAndRange = ({
    nameTooltip,
    displayName,
    rangeProps,
    countCell,
    hasCount,
}) => (
    <>
        <td
            ref={nameTooltip.ref}
            className={styles.legendName}
            style={{ maxWidth: '8.5em' }}
            onMouseEnter={nameTooltip.onMouseEnter}
            onMouseLeave={nameTooltip.onMouseLeave}
        >
            {displayName}
        </td>
        <td className={styles.legendNameSpacer}></td>
        <RangeCells {...rangeProps} />
        {hasCount && <td className={styles.legendSpacer}></td>}
        {countCell}
        {nameTooltip.portal}
    </>
)

// --- LegendItemRange ---

const LegendItemRange = ({
    name = '',
    showRange = true,
    startValue,
    endValue,
    count,
    decimalPlaces,
    useCompact = false,
    isPlugin = false,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const zoom = isPlugin ? 0.85 : 1

    const hasName = showRange && !!name
    const hasRange = startValue !== undefined && endValue !== undefined
    const hasOpenHigh = startValue !== undefined && endValue === undefined
    const hasOpenLow = startValue === undefined && endValue !== undefined
    const hasCount = count !== undefined

    let formattedCount
    let isCountCompact = false
    let countTooltipContent

    if (hasCount) {
        formattedCount = formatCount(count)
        isCountCompact = formattedCount !== count
        countTooltipContent = `(${formatWithSeparator(
            count,
            keyAnalysisDigitGroupSeparator
        )})`
    }

    const nameTooltip = useNameTooltip(name, zoom)
    const openHighScale =
        useCompact && hasOpenHigh ? getCompactScale([startValue]) : null
    const openHighTooltip = useValueTooltip(
        hasOpenHigh
            ? `> ${formatWithSeparator(
                  startValue,
                  keyAnalysisDigitGroupSeparator,
                  { precision: decimalPlaces }
              )}`
            : undefined,
        tooltipCx(styles.legendRangeTooltip),
        { scale: openHighScale, zoom }
    )
    const openLowScale =
        useCompact && hasOpenLow ? getCompactScale([endValue]) : null
    const openLowTooltip = useValueTooltip(
        hasOpenLow
            ? `< ${formatWithSeparator(
                  endValue,
                  keyAnalysisDigitGroupSeparator,
                  { precision: decimalPlaces }
              )}`
            : undefined,
        tooltipCx(styles.legendRangeTooltip),
        { scale: openLowScale, zoom }
    )
    const countTooltip = useValueTooltip(
        countTooltipContent,
        tooltipCx(styles.legendCountTooltip),
        { scale: isCountCompact, zoom }
    )

    // computed at top level to avoid nesting penalty; only rendered when formattedCount is defined
    const countContent = isCountCompact ? (
        <button
            ref={countTooltip.ref}
            type="button"
            className={styles.legendValueButton}
            onClick={countTooltip.onClick}
            onMouseEnter={countTooltip.onMouseEnter}
            onMouseLeave={countTooltip.onMouseLeave}
            onFocus={countTooltip.onFocus}
            onBlur={countTooltip.onBlur}
        >{`(${formattedCount})`}</button>
    ) : (
        `(${formattedCount})`
    )

    const countCell = (
        <td className={styles.legendCount}>
            {formattedCount !== undefined && countContent}
            {countTooltip.portal}
        </td>
    )

    if (!hasRange) {
        if (hasOpenHigh) {
            return renderOpenBound({
                tooltip: openHighTooltip,
                displayValue: `> ${formatCompact(startValue, openHighScale, {
                    decimalPlaces,
                    separator: keyAnalysisDigitGroupSeparator,
                })}`,
                scale: openHighScale,
                countCell,
                atEnd: false,
            })
        }
        if (hasOpenLow) {
            return renderOpenBound({
                tooltip: openLowTooltip,
                displayValue: `< ${formatCompact(endValue, openLowScale, {
                    decimalPlaces,
                    separator: keyAnalysisDigitGroupSeparator,
                })}`,
                scale: openLowScale,
                countCell,
                atEnd: true,
            })
        }
        // Category / special class: name only
        return renderNameOnly({ nameTooltip, name, countCell, hasCount })
    }

    // Range display values — computed only when range is available
    const opts = { precision: decimalPlaces }
    const displayName = showRange ? name : ''

    const startScale = useCompact ? getCompactScale([startValue]) : null
    const endScale = useCompact ? getCompactScale([endValue]) : null

    const displayStart = formatCompact(startValue, startScale, {
        decimalPlaces,
        separator: keyAnalysisDigitGroupSeparator,
    })
    const displayEnd = formatCompact(endValue, endScale, {
        decimalPlaces,
        separator: keyAnalysisDigitGroupSeparator,
    })

    const rangeProps = {
        displayStart,
        displayEnd,
        startScale,
        endScale,
        startValue,
        endValue,
        keyAnalysisDigitGroupSeparator,
        opts,
        zoom,
    }

    if (!hasName) {
        // Unlabelled numeric range
        return renderRangeOnly({ rangeProps, countCell })
    }

    // Named numeric range
    return renderNameAndRange({
        nameTooltip,
        displayName,
        rangeProps,
        countCell,
        hasCount,
    })
}

LegendItemRange.propTypes = {
    count: PropTypes.number,
    decimalPlaces: PropTypes.number,
    endValue: PropTypes.number,
    isPlugin: PropTypes.bool,
    name: PropTypes.string,
    showRange: PropTypes.bool,
    startValue: PropTypes.number,
    useCompact: PropTypes.bool,
}

export default LegendItemRange
