import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
    extractLabel,
    legendNamesContainRange,
    parseRange,
    sortLegendItems,
} from '../../util/legend.js'
import {
    formatWithSeparator,
    getCompactScale,
    MAX_LEGEND_VALUE_LENGTH,
} from '../../util/numbers.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'
import Bubbles from './Bubbles.jsx'
import LegendDataQuality from './LegendDataQuality.jsx'
import LegendItem from './LegendItem.jsx'
import styles from './styles/Legend.module.css'

const NAME_OVERFLOW_THRESHOLD = 0.33

// Range formatting helpers
// -----

const countDecimals = (value) => {
    const dot = String(value).indexOf('.')
    return dot === -1 ? 0 : String(value).length - dot - 1
}

// Infer decimal places from the data when not explicitly provided.
// Returns undefined for all-integer data so compact formatting can apply its own default.
const inferDecimalPlaces = (rangeItems) => {
    if (rangeItems.length === 0) {
        return undefined
    }
    const max = Math.max(
        ...rangeItems.flatMap(({ startValue, endValue }) =>
            endValue === undefined
                ? [countDecimals(startValue)]
                : [countDecimals(startValue), countDecimals(endValue)]
        )
    )
    return max > 0 ? max : undefined
}

// True when the name already encodes the range (e.g. "100 – 200") — avoids showing numbers twice.
const nameEncodesRange = (name, startValue, endValue) => {
    const [parsedStart, parsedEnd] = parseRange(name)
    return (
        typeof parsedStart === 'number' &&
        !Number.isNaN(parsedStart) &&
        typeof parsedEnd === 'number' &&
        !Number.isNaN(parsedEnd) &&
        Math.abs(parsedStart - startValue) < 1e-9 &&
        Math.abs(parsedEnd - endValue) < 1e-9
    )
}

// Resolves start/end values after range-suppression: hides range for isolated named
// items, and strips values when the name already encodes them (e.g. "100 – 200").
const resolveRangeValues = (item, itemShowRange) => {
    const { startValue, endValue } = item
    if (startValue === undefined) {
        return { startValue, endValue }
    }
    if (item.isIsolated && item.name) {
        return {}
    }
    if (
        !itemShowRange &&
        item.name &&
        !nameEncodesRange(item.name, startValue, endValue)
    ) {
        return {}
    }
    return { startValue, endValue }
}

// Rendering a layer legend in the left drawer, on a map (download) or in a control (plugin)
const Legend = ({
    description,
    filters,
    coordinateFields,
    groups,
    unit,
    items,
    bubbles,
    explanation,
    url,
    source,
    sourceUrl,
    decimalPlaces,
    eventsWithoutCoordinatesCount,
    eventsOutsideOrgUnitsCount,
    orgUnitsWithoutBoundaryCount,
    orgUnitsTotalCount,
    orgUnitsWithoutCoordinatesCount,
    orgUnitsPointOnly = false,
    isPlugin = false,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    // Item list preparation
    // -----

    const sortedItems = useMemo(
        () =>
            Array.isArray(items)
                ? sortLegendItems(items)
                      .map((item) => {
                          if ('startValue' in item) {
                              return item
                          }
                          if (
                              Number.isFinite(item.from) &&
                              Number.isFinite(item.to)
                          ) {
                              return {
                                  ...item,
                                  startValue: item.from,
                                  endValue: item.to,
                              }
                          }
                          if (Number.isFinite(item.from)) {
                              // Open-end high (e.g. "> max" from Earth Engine) - no endValue
                              return { ...item, startValue: item.from }
                          }
                          if (Number.isFinite(item.to)) {
                              // Open-end low (e.g. "< min" from Earth Engine) - no startValue
                              return { ...item, endValue: item.to }
                          }
                          return item
                      })
                      .map((item) => {
                          if (
                              !item.isIsolated &&
                              item.name &&
                              item.startValue !== undefined &&
                              item.endValue !== undefined
                          ) {
                              const label = extractLabel(
                                  item.name,
                                  item.startValue,
                                  item.endValue
                              )
                              if (label !== item.name) {
                                  return { ...item, name: label }
                              }
                          }
                          return item
                      })
                : [],
        [items]
    )

    // Table overflow suppression
    // -----

    const tableRef = useRef(null)
    const [suppressAllRanges, setSuppressAllRanges] = useState(false)
    // Reset suppression whenever items change so the measurement effect re-runs with a clean state.
    useLayoutEffect(() => {
        setSuppressAllRanges(false)
    }, [sortedItems])
    useLayoutEffect(() => {
        const table = tableRef.current
        if (!table) {
            return
        }

        const updateNameMaxWidth = () => {
            const firstNameCell = table.querySelector('[data-legend-name]')
            if (firstNameCell) {
                const row = firstNameCell.closest('tr')
                const cells = [...row.cells]
                const fixedWidth = cells
                    .slice(cells.indexOf(firstNameCell) + 1)
                    .filter((cell) => cell.textContent.trim())
                    .reduce((sum, cell) => sum + cell.offsetWidth, 0)
                table.style.setProperty(
                    '--legend-name-max-width',
                    `${
                        table.parentElement.offsetWidth -
                        row.cells[0].offsetWidth -
                        fixedWidth
                    }px`
                )
            } else {
                table.style.removeProperty('--legend-name-max-width')
            }
        }

        // Apply name max-width before measuring overflow — reading scrollWidth
        // after setProperty forces a synchronous reflow, so overflow detection
        // sees the constrained layout.
        updateNameMaxWidth()

        // Re-run whenever the container width changes (e.g. scrollbar appears).
        const resizeObserver = new ResizeObserver(updateNameMaxWidth)
        resizeObserver.observe(table.parentElement)

        if (suppressAllRanges) {
            return () => resizeObserver.disconnect()
        }
        const nameCells = [...table.querySelectorAll('[data-legend-name]')]
        if (!nameCells.length) {
            return () => resizeObserver.disconnect()
        }
        const overflowing = nameCells.filter(
            (el) => el.scrollWidth > el.offsetWidth
        ).length
        if (overflowing / nameCells.length >= NAME_OVERFLOW_THRESHOLD) {
            setSuppressAllRanges(true)
        }
        return () => resizeObserver.disconnect()
    }, [suppressAllRanges, sortedItems])

    // Range & scale computations
    // -----

    // Suppress range columns when all names already encode the range; isolated
    // items are checked individually as they may differ from the rest.
    const showRange =
        sortedItems.length > 0 && !legendNamesContainRange(sortedItems)
    const getShowRange = (item) =>
        item.isIsolated
            ? !legendNamesContainRange([item])
            : !item.name || showRange

    // Include open-end items (one bound only) for decimal/compact inference
    const rangeItems = sortedItems.filter(
        (item) => item.startValue !== undefined || item.endValue !== undefined
    )
    const effectiveDecimalPlaces =
        decimalPlaces ?? inferDecimalPlaces(rangeItems)

    const allRangeValues = rangeItems.flatMap(({ startValue, endValue }) => {
        const vals = []
        if (startValue !== undefined) {
            vals.push(startValue)
        }
        if (endValue !== undefined) {
            vals.push(endValue)
        }
        return vals
    })
    // Named ranges make the row tight — prefer compact even if values aren't long individually.
    const hasNamedRanges = rangeItems
        .filter((item) => !item.isIsolated)
        .some((item) => getShowRange(item) && item.name)
    // Compact (1.2M, 4.5k…): only when a scale applies and space is tight or a value overflows.
    const useCompact =
        getCompactScale(allRangeValues) !== null &&
        (hasNamedRanges ||
            allRangeValues.some(
                (v) =>
                    formatWithSeparator(v, keyAnalysisDigitGroupSeparator, {
                        precision: effectiveDecimalPlaces,
                    }).length > MAX_LEGEND_VALUE_LENGTH
            ))

    // If scientific notation is needed for any non-extreme value, force it for
    // all values so the legend stays visually consistent. When it only appears at
    // the global max/min (fake-infinity placeholders), per-value SI notation is
    // kept and the mixing at those boundary rows is accepted.
    const globalMax =
        allRangeValues.length > 0 ? Math.max(...allRangeValues) : undefined
    const globalMin =
        allRangeValues.length > 0 ? Math.min(...allRangeValues) : undefined
    const forceScientific =
        useCompact &&
        allRangeValues.some(
            (v) =>
                v !== globalMax &&
                v !== globalMin &&
                getCompactScale([v])?.scientific
        )

    // Row rendering
    // -----

    const renderRow = (item, index) => {
        const itemShowRange = getShowRange(item)
        const { startValue, endValue } = resolveRangeValues(item, itemShowRange)
        return (
            <LegendItem
                {...item}
                startValue={startValue}
                endValue={endValue}
                showRange={itemShowRange}
                decimalPlaces={effectiveDecimalPlaces}
                useCompact={useCompact}
                isPlugin={isPlugin}
                suppressRange={suppressAllRanges}
                forceScientific={forceScientific}
                key={`${item.name ?? ''}-${item.startValue ?? ''}-${
                    item.endValue ?? ''
                }-${index}`}
            />
        )
    }

    // Render
    // -----

    return (
        <dl className={styles.legend} data-test="layerlegend">
            {description && (
                <div className={styles.description}>{description}</div>
            )}
            {groups && (
                <div className={styles.group}>
                    {groups.multiple === false ? (
                        <>{groups.list[0].name}</>
                    ) : (
                        <>
                            {groups.label}
                            {groups.list.map(({ id, name }) => (
                                <div key={id}>{name}</div>
                            ))}
                        </>
                    )}
                </div>
            )}
            {unit && items && <div className={styles.unit}>{unit}</div>}
            {!bubbles && sortedItems.length > 0 && (
                <table ref={tableRef}>
                    <tbody>
                        {sortedItems.map((item, index) =>
                            renderRow(item, index)
                        )}
                    </tbody>
                </table>
            )}
            {bubbles && (
                <Bubbles {...bubbles} classes={items} isPlugin={isPlugin} />
            )}
            {url && <img className={styles.legendImage} src={url} alt="" />}
            {Array.isArray(coordinateFields) && (
                <div className={styles.coordinateFields}>
                    <div>{i18n.t('Coordinate field')}</div>
                    {coordinateFields.map((coordinateField, index) => (
                        <div key={index}>{coordinateField}</div>
                    ))}
                </div>
            )}
            {Array.isArray(filters) && (
                <div className={styles.filters} data-test="layerlegend-filters">
                    <div>{i18n.t('Filters')}</div>
                    {filters.map((filter, index) => (
                        <div key={index}>{filter}</div>
                    ))}
                </div>
            )}
            {Array.isArray(explanation) && (
                <div className={styles.explanation}>
                    {explanation.map((expl, index) => (
                        <div key={index}>{expl}</div>
                    ))}
                </div>
            )}
            {source && (
                <div className={styles.source}>
                    {i18n.t('Source')}:&nbsp;
                    {sourceUrl ? (
                        <a href={sourceUrl} target="_blank" rel="noreferrer">
                            {source}
                        </a>
                    ) : (
                        <span>{source}</span>
                    )}
                </div>
            )}
            <LegendDataQuality
                eventsWithoutCoordinatesCount={eventsWithoutCoordinatesCount}
                eventsOutsideOrgUnitsCount={eventsOutsideOrgUnitsCount}
                orgUnitsWithoutBoundaryCount={orgUnitsWithoutBoundaryCount}
                orgUnitsTotalCount={orgUnitsTotalCount}
                orgUnitsWithoutCoordinatesCount={
                    orgUnitsWithoutCoordinatesCount
                }
                orgUnitsPointOnly={orgUnitsPointOnly}
                isPlugin={isPlugin}
            />
        </dl>
    )
}

Legend.propTypes = {
    bubbles: PropTypes.shape({
        radiusHigh: PropTypes.number.isRequired,
        radiusLow: PropTypes.number.isRequired,
        color: PropTypes.string,
        legendDecimalPlaces: PropTypes.number,
    }),
    coordinateFields: PropTypes.array,
    decimalPlaces: PropTypes.number,
    description: PropTypes.string,
    eventsOutsideOrgUnitsCount: PropTypes.number,
    eventsWithoutCoordinatesCount: PropTypes.number,
    explanation: PropTypes.array,
    filters: PropTypes.array,
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    isPlugin: PropTypes.bool,
    items: PropTypes.array,
    orgUnitsPointOnly: PropTypes.bool,
    orgUnitsTotalCount: PropTypes.number,
    orgUnitsWithoutBoundaryCount: PropTypes.number,
    orgUnitsWithoutCoordinatesCount: PropTypes.number,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    unit: PropTypes.string,
    url: PropTypes.string,
}

export default Legend
