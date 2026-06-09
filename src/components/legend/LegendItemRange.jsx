import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    extractScientificParts,
    formatCompact,
    formatCount,
    formatWithSeparator,
    getCompactScale,
    SCIENTIFIC_SCALE,
} from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import styles from './styles/LegendItemRange.module.css'

// --- Scientific notation component ---

const ScientificNotation = ({ mantissa, sign, exponent }) => (
    <span style={{ whiteSpace: 'nowrap' }}>
        {mantissa}
        <span
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                verticalAlign: 'middle',
                fontSize: '0.7em',
                margin: '0 0.15em',
                transform: 'scaleY(0.8)',
                transformOrigin: 'center',
            }}
        >
            <span style={{ lineHeight: 0.9 }}>&nbsp;{sign}</span>
            <span style={{ lineHeight: 0.9, marginBottom: '0.35em' }}>·E</span>
        </span>
        <span
            style={{
                fontSize: '0.9em',
                position: 'relative',
                verticalAlign: 'center',
                lineHeight: 0,
            }}
        >
            {exponent}
        </span>
    </span>
)

ScientificNotation.propTypes = {
    exponent: PropTypes.string,
    mantissa: PropTypes.string,
    sign: PropTypes.string,
}

const formatCompactNode = (value, scale, { decimalPlaces, separator } = {}) => {
    if (scale?.scientific) {
        return (
            <ScientificNotation
                {...extractScientificParts(value, decimalPlaces)}
            />
        )
    }
    return formatCompact(value, scale, { decimalPlaces, separator })
}

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

// Shows only when the element overflows, or always when tooltipOverride is provided.
const useNameTooltip = (name, zoom, tooltipOverride = null) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    return {
        ref,
        onMouseEnter: () => {
            const el = ref.current
            if (
                el &&
                (tooltipOverride !== null || el.scrollWidth > el.offsetWidth)
            ) {
                setPos(captureTooltipPos(el, zoom))
            }
        },
        onMouseLeave: () => setPos(null),
        portal: makePortalTooltip(
            pos,
            styles.legendTooltip,
            tooltipOverride ?? name
        ),
    }
}

const useValueTooltip = (content, className, { active, zoom }) => {
    const [pos, setPos] = useState(null)
    const ref = useRef(null)
    const show = active
        ? () => setPos(captureTooltipPos(ref.current, zoom))
        : undefined
    const hide = active ? () => setPos(null) : undefined
    return {
        ref: active ? ref : undefined,
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
        { active: startScale, zoom }
    )
    const endTooltip = useValueTooltip(
        formatWithSeparator(endValue, keyAnalysisDigitGroupSeparator, opts),
        rangeTooltipClass,
        { active: endScale, zoom }
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
    displayEnd: PropTypes.node,
    displayStart: PropTypes.node,
    endScale: PropTypes.object,
    endValue: PropTypes.number,
    keyAnalysisDigitGroupSeparator: PropTypes.string,
    opts: PropTypes.object,
    startScale: PropTypes.object,
    startValue: PropTypes.number,
    zoom: PropTypes.number,
}

// --- Render helpers ---

// Open-bound items ("< min" / "> max")
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

// Columns: legendNameEmpty + spacer + start + dash + end (+ count when present)
const RANGE_COL_COUNT = 5
const TOTAL_COL_COUNT = 6

// Category items, special classes (no data, unclassified): name only, no range columns
const renderNameOnly = ({ nameTooltip, name, countCell, hasCount }) => (
    <>
        <td
            ref={nameTooltip.ref}
            colSpan={hasCount ? TOTAL_COL_COUNT : RANGE_COL_COUNT}
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
            data-legend-name="" // marker - queried as [data-legend-name] in Legend.jsx
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

const getBoundType = (startValue, endValue) => {
    if (startValue !== undefined && endValue !== undefined) {
        return 'range'
    }
    if (startValue !== undefined) {
        return 'openHigh'
    }
    if (endValue !== undefined) {
        return 'openLow'
    }
    return 'none'
}

const resolveScale = (value, useCompact, forceScientific) => {
    if (forceScientific) {
        return SCIENTIFIC_SCALE
    }
    return useCompact ? getCompactScale([value]) : null
}

const buildRangeTooltip = ({
    name,
    startValue,
    endValue,
    useCompact,
    forceScientific,
    decimalPlaces,
    separator,
}) => (
    <>
        {name}{' '}
        <span style={{ color: 'var(--colors-grey800)' }}>
            {formatCompactNode(
                startValue,
                resolveScale(startValue, useCompact, forceScientific),
                { decimalPlaces, separator }
            )}
            {' – '}
            {formatCompactNode(
                endValue,
                resolveScale(endValue, useCompact, forceScientific),
                { decimalPlaces, separator }
            )}
        </span>
    </>
)

const buildRangeProps = ({
    startValue,
    endValue,
    useCompact,
    forceScientific,
    decimalPlaces,
    separator,
    zoom,
}) => {
    const startScale = resolveScale(startValue, useCompact, forceScientific)
    const endScale = resolveScale(endValue, useCompact, forceScientific)
    return {
        displayStart: formatCompactNode(startValue, startScale, {
            decimalPlaces,
            separator,
        }),
        displayEnd: formatCompactNode(endValue, endScale, {
            decimalPlaces,
            separator,
        }),
        startScale,
        endScale,
        startValue,
        endValue,
        keyAnalysisDigitGroupSeparator: separator,
        opts: { precision: decimalPlaces },
        zoom,
    }
}

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
    suppressRange = false,
    forceScientific = false,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    const zoom = isPlugin ? 0.85 : 1

    const hasName = showRange && !!name
    const boundType = getBoundType(startValue, endValue)
    const hasRange = boundType === 'range'
    const hasOpenHigh = boundType === 'openHigh'
    const hasOpenLow = boundType === 'openLow'
    const hasCount = count !== undefined

    let formattedCount
    let isCountCompact = false
    let countTooltipContent

    if (hasCount) {
        formattedCount = formatCount(count)
        isCountCompact = typeof formattedCount === 'string'
        countTooltipContent = `(${formatWithSeparator(
            count,
            keyAnalysisDigitGroupSeparator
        )})`
    }

    const rangeTooltip =
        suppressRange && startValue !== undefined && endValue !== undefined
            ? buildRangeTooltip({
                  name,
                  startValue,
                  endValue,
                  useCompact,
                  forceScientific,
                  decimalPlaces,
                  separator: keyAnalysisDigitGroupSeparator,
              })
            : null
    const nameTooltip = useNameTooltip(name, zoom, rangeTooltip)

    const openHighScale = resolveScale(startValue, useCompact, forceScientific)
    const openHighTooltip = useValueTooltip(
        `> ${formatWithSeparator(startValue, keyAnalysisDigitGroupSeparator, {
            precision: decimalPlaces,
        })}`,
        tooltipCx(styles.legendRangeTooltip),
        { active: openHighScale, zoom }
    )
    const openLowScale = resolveScale(endValue, useCompact, forceScientific)
    const openLowTooltip = useValueTooltip(
        `< ${formatWithSeparator(endValue, keyAnalysisDigitGroupSeparator, {
            precision: decimalPlaces,
        })}`,
        tooltipCx(styles.legendRangeTooltip),
        { active: openLowScale, zoom }
    )
    const countTooltip = useValueTooltip(
        countTooltipContent,
        tooltipCx(styles.legendCountTooltip),
        { active: isCountCompact, zoom }
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

    if (hasOpenHigh) {
        return renderOpenBound({
            tooltip: openHighTooltip,
            displayValue: (
                <>
                    {'> '}
                    {formatCompactNode(startValue, openHighScale, {
                        decimalPlaces,
                        separator: keyAnalysisDigitGroupSeparator,
                    })}
                </>
            ),
            scale: openHighScale,
            countCell,
            atEnd: false,
        })
    }
    if (hasOpenLow) {
        return renderOpenBound({
            tooltip: openLowTooltip,
            displayValue: (
                <>
                    {'< '}
                    {formatCompactNode(endValue, openLowScale, {
                        decimalPlaces,
                        separator: keyAnalysisDigitGroupSeparator,
                    })}
                </>
            ),
            scale: openLowScale,
            countCell,
            atEnd: true,
        })
    }
    if (!hasRange) {
        // Category / special class: name only
        return renderNameOnly({ nameTooltip, name, countCell, hasCount })
    }

    // Range display values - computed only when range is available
    const rangeProps = buildRangeProps({
        startValue,
        endValue,
        useCompact,
        forceScientific,
        decimalPlaces,
        separator: keyAnalysisDigitGroupSeparator,
        zoom,
    })

    if (!hasName) {
        // Unlabelled numeric range
        return renderRangeOnly({ rangeProps, countCell })
    }

    if (suppressRange) {
        return renderNameOnly({ nameTooltip, name, countCell, hasCount })
    }

    // Named numeric range
    return renderNameAndRange({
        nameTooltip,
        displayName: name,
        rangeProps,
        countCell,
        hasCount,
    })
}

LegendItemRange.propTypes = {
    count: PropTypes.number,
    decimalPlaces: PropTypes.number,
    endValue: PropTypes.number,
    forceScientific: PropTypes.bool,
    isPlugin: PropTypes.bool,
    name: PropTypes.string,
    showRange: PropTypes.bool,
    startValue: PropTypes.number,
    suppressRange: PropTypes.bool,
    useCompact: PropTypes.bool,
}

export default LegendItemRange
