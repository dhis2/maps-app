import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import {
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
import LegendItem from './LegendItem.jsx'
import styles from './styles/Legend.module.css'

const countDecimals = (value) => {
    const dot = String(value).indexOf('.')
    return dot === -1 ? 0 : String(value).length - dot - 1
}

// Infer decimal places from the data when not explicitly provided.
const inferDecimalPlaces = (rangeItems) =>
    rangeItems.length > 0
        ? Math.max(
              ...rangeItems.flatMap(({ startValue, endValue }) => [
                  countDecimals(startValue),
                  countDecimals(endValue),
              ])
          )
        : undefined

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
    orgUnitsWithoutCoordinatesCount,
    orgUnitsPointOnly = false,
    isPlugin = false,
}) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()

    // Normalise from/to → startValue/endValue
    const sortedItems = Array.isArray(items)
        ? sortLegendItems(items).map((item) =>
              !('startValue' in item) &&
              Number.isFinite(item.from) &&
              Number.isFinite(item.to)
                  ? { ...item, startValue: item.from, endValue: item.to }
                  : item
          )
        : []

    // Suppress range columns when all names already encode the range; isolated
    // items are checked individually as they may differ from the rest.
    const showRange =
        sortedItems.length > 0 && !legendNamesContainRange(sortedItems)
    const getShowRange = (item) =>
        item.isIsolated
            ? !legendNamesContainRange([item])
            : !item.name || showRange

    const rangeItems = sortedItems.filter(
        (item) => item.startValue !== undefined && item.endValue !== undefined
    )
    const effectiveDecimalPlaces =
        decimalPlaces ?? inferDecimalPlaces(rangeItems)

    const allRangeValues = rangeItems.flatMap(({ startValue, endValue }) => [
        startValue,
        endValue,
    ])
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

    const renderRow = (item) => {
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
                key={`${item.name ?? ''}-${item.startValue ?? ''}-${
                    item.endValue ?? ''
                }`}
            />
        )
    }

    const dataQuality = (typeof eventsWithoutCoordinatesCount === 'number' ||
        typeof orgUnitsWithoutCoordinatesCount === 'number') && (
        <div className={styles.dataQuality}>
            <div>{i18n.t('Data quality')}:</div>
            {typeof eventsWithoutCoordinatesCount === 'number' && (
                <div>
                    {i18n.t('{{n}} event without coordinates', {
                        count: eventsWithoutCoordinatesCount,
                        n: formatWithSeparator(
                            eventsWithoutCoordinatesCount,
                            keyAnalysisDigitGroupSeparator
                        ),
                        defaultValue_plural: '{{n}} events without coordinates',
                    })}
                </div>
            )}
            {typeof orgUnitsWithoutCoordinatesCount === 'number' && (
                <div>
                    {orgUnitsPointOnly
                        ? i18n.t('{{n}} org unit without a point location', {
                              count: orgUnitsWithoutCoordinatesCount,
                              n: formatWithSeparator(
                                  orgUnitsWithoutCoordinatesCount,
                                  keyAnalysisDigitGroupSeparator
                              ),
                              defaultValue_plural:
                                  '{{n}} org units without a point location',
                          })
                        : i18n.t('{{n}} org unit without coordinates', {
                              count: orgUnitsWithoutCoordinatesCount,
                              n: formatWithSeparator(
                                  orgUnitsWithoutCoordinatesCount,
                                  keyAnalysisDigitGroupSeparator
                              ),
                              defaultValue_plural:
                                  '{{n}} org units without coordinates',
                          })}
                </div>
            )}
        </div>
    )

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
                <table>
                    <tbody>{sortedItems.map(renderRow)}</tbody>
                </table>
            )}
            {bubbles && (
                <Bubbles {...bubbles} classes={items} isPlugin={isPlugin} />
            )}
            {url && <img className={styles.legendImage} src={url} />}
            {Array.isArray(coordinateFields) && (
                <div className={styles.coordinateFields}>
                    <div>{i18n.t('Coordinate field')}:</div>
                    {coordinateFields.map((coordinateField, index) => (
                        <div key={index}>{coordinateField}</div>
                    ))}
                </div>
            )}
            {Array.isArray(filters) && (
                <div className={styles.filters} data-test="layerlegend-filters">
                    <div>{i18n.t('Filters')}:</div>
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
            {dataQuality}
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
        </dl>
    )
}

Legend.propTypes = {
    bubbles: PropTypes.shape({
        radiusHigh: PropTypes.number.isRequired,
        radiusLow: PropTypes.number.isRequired,
        color: PropTypes.string,
    }),
    coordinateFields: PropTypes.array,
    decimalPlaces: PropTypes.number,
    description: PropTypes.string,
    eventsWithoutCoordinatesCount: PropTypes.number,
    explanation: PropTypes.array,
    filters: PropTypes.array,
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    isPlugin: PropTypes.bool,
    items: PropTypes.array,
    orgUnitsPointOnly: PropTypes.bool,
    orgUnitsWithoutCoordinatesCount: PropTypes.number,
    source: PropTypes.string,
    sourceUrl: PropTypes.string,
    unit: PropTypes.string,
    url: PropTypes.string,
}

export default Legend
