import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    formatCompact,
    formatWithSeparator,
    getCompactScale,
} from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/LegendItemRange.module.css'

// --- Tooltip infrastructure ---

const captureTooltipPos = (el) => {
    if (!el) {
        return null
    }
    const { top, left } = el.getBoundingClientRect()
    return { top, left, color: getComputedStyle(el).color }
}

const makePortalTooltip = (pos, className, children) =>
    pos &&
    createPortal(
        <div
            className={className}
            style={{ top: pos.top, left: pos.left, color: pos.color }}
        >
            {children}
        </div>,
        document.body
    )

const tooltipCx = (specificClass, pluginClass, isPlugin) =>
    cx(styles.legendTooltip, specificClass, {
        [styles.legendTooltipPlugin]: isPlugin,
        [pluginClass]: isPlugin,
    })

// Shows only when the element overflows (truncated name)
const useNameTooltip = (name, isPlugin) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    return {
        ref,
        onMouseEnter: () => {
            const el = ref.current
            if (el && el.scrollWidth > el.offsetWidth) {
                setPos(captureTooltipPos(el))
            }
        },
        onMouseLeave: () => setPos(null),
        portal: makePortalTooltip(
            pos,
            tooltipCx(
                styles.legendNameTooltip,
                styles.legendNameTooltipPlugin,
                isPlugin
            ),
            name
        ),
    }
}

// Shows on hover when the value is compacted (scale != null)
const useValueTooltip = (content, className, scale) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    return {
        ref: scale ? ref : undefined,
        onMouseEnter: scale
            ? () => setPos(captureTooltipPos(ref.current))
            : undefined,
        onMouseLeave: scale ? () => setPos(null) : undefined,
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
    isPlugin,
}) => {
    const rangeTooltipClass = tooltipCx(
        styles.legendRangeTooltip,
        styles.legendRangeTooltipPlugin,
        isPlugin
    )
    const startTooltip = useValueTooltip(
        formatWithSeparator(startValue, keyAnalysisDigitGroupSeparator, opts),
        rangeTooltipClass,
        startScale
    )
    const endTooltip = useValueTooltip(
        formatWithSeparator(endValue, keyAnalysisDigitGroupSeparator, opts),
        rangeTooltipClass,
        endScale
    )

    return (
        <>
            <td className={styles.legendStart}>
                <span
                    ref={startTooltip.ref}
                    onMouseEnter={startTooltip.onMouseEnter}
                    onMouseLeave={startTooltip.onMouseLeave}
                >
                    {displayStart}
                </span>
                {startTooltip.portal}
            </td>
            <td className={styles.legendDash}>{'–'}</td>
            <td className={styles.legendEnd}>
                <span
                    ref={endTooltip.ref}
                    onMouseEnter={endTooltip.onMouseEnter}
                    onMouseLeave={endTooltip.onMouseLeave}
                >
                    {displayEnd}
                </span>
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
    isPlugin: PropTypes.bool,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    opts: PropTypes.object,
    startScale: PropTypes.object,
    startValue: PropTypes.number,
}

// --- Render helpers ---

// Category items, special classes (no data, unclassified): name only, no range columns
const renderNameOnly = ({ nameTooltip, name, countCell, hasCount }) => {
    console.log('🚀 ~ renderNameOnly ~ hasCount:', hasCount)
    return (
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
}

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
    nameMaxWidth,
    rangeProps,
    countCell,
    hasCount,
}) => (
    <>
        <td
            ref={nameTooltip.ref}
            className={styles.legendName}
            style={{ maxWidth: nameMaxWidth }}
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

    const hasName = showRange && !!name
    const hasRange = startValue !== undefined && endValue !== undefined
    const hasCount = count !== undefined

    // Count is always compacted independently of range values
    const countScale = hasCount ? getCompactScale([count]) : null
    const formattedCount = hasCount
        ? formatCompact(count, countScale, {
              decimalPlaces: 0,
              separator: keyAnalysisDigitGroupSeparator,
          })
        : undefined
    const countTooltipContent = hasCount
        ? `(${formatWithSeparator(count, keyAnalysisDigitGroupSeparator)})`
        : undefined

    const nameTooltip = useNameTooltip(name, isPlugin)
    const countTooltip = useValueTooltip(
        countTooltipContent,
        tooltipCx(
            styles.legendCountTooltip,
            styles.legendCountTooltipPlugin,
            isPlugin
        ),
        countScale
    )

    const countCell = (
        <td className={styles.legendCount}>
            {formattedCount !== undefined ? (
                <span
                    ref={countTooltip.ref}
                    onMouseEnter={countTooltip.onMouseEnter}
                    onMouseLeave={countTooltip.onMouseLeave}
                >{`(${formattedCount})`}</span>
            ) : null}
            {countTooltip.portal}
        </td>
    )

    if (!hasRange) {
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

    // Budget: ~14em for name + range + count. Each char ≈ 0.5em (tabular nums).
    // Count column: "(1.2M)" length * 0.5em + ~0.6em for its padding-left.
    const countColumnWidth =
        hasCount && formattedCount !== undefined
            ? (formattedCount.length + 2) * 0.5 + 0.6
            : 0
    const nameMaxWidth = hasName
        ? `${Math.max(
              4,
              Math.min(
                  hasCount ? 10 : 12,
                  12 -
                      (displayStart.length + displayEnd.length) * 0.5 -
                      countColumnWidth
              )
          ).toFixed(1)}em`
        : undefined

    const rangeProps = {
        displayStart,
        displayEnd,
        startScale,
        endScale,
        startValue,
        endValue,
        keyAnalysisDigitGroupSeparator,
        opts,
        isPlugin,
    }

    if (!hasName) {
        // Unlabelled numeric range
        return renderRangeOnly({ rangeProps, countCell })
    }

    // Named numeric range
    return renderNameAndRange({
        nameTooltip,
        displayName,
        nameMaxWidth,
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
