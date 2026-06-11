// Utils for thematic mapping
import { precisionRound } from 'd3-format'
import { ckmeans, mean, standardDeviation } from 'simple-statistics'
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_NATURAL_BREAKS_RANGES,
    CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
    CLASSIFICATION_STANDARD_DEVIATION,
    CLASSIFICATION_LOGARITHMIC,
    CLASSIFICATION_PRETTY_BREAKS,
} from '../constants/layers.js'
import { hasValue } from './helpers.js'
import { isRegularLegendItem } from './legend.js'
import { getRoundToPrecisionFn } from './numbers.js'

// Returns legend item where a value belongs
export const getLegendItemForValue = ({
    value,
    valueFormat,
    method,
    legendItems,
    clamp = false,
}) => {
    if (!hasValue(value) || legendItems.length === 0) {
        return
    }

    const formattedValue = valueFormat ? valueFormat(value) : value

    const isolatedItem = legendItems.find(
        (item) =>
            item.isIsolated &&
            formattedValue >= item.startValue &&
            formattedValue <= item.endValue
    )
    if (isolatedItem) {
        return isolatedItem
    }

    const rangeItems = legendItems.filter(isRegularLegendItem)

    if (clamp && rangeItems.length > 0) {
        if (formattedValue < rangeItems[0].startValue) {
            return rangeItems[0]
        }
        if (formattedValue > rangeItems.at(-1).endValue) {
            return rangeItems.at(-1)
        }
    }

    const isClusters = method === CLASSIFICATION_NATURAL_BREAKS_CLUSTERS
    return rangeItems.find((item, index) =>
        item.startValue === item.endValue
            ? formattedValue === item.startValue
            : formattedValue >= item.startValue &&
              (formattedValue < item.endValue ||
                  (formattedValue === item.endValue &&
                      (isClusters || index === rangeItems.length - 1)))
    )
}

export const getLegendItems = (
    values,
    method,
    { numClasses, precision } = {}
) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    if (minValue === maxValue) {
        return {
            items: [{ startValue: minValue, endValue: maxValue }],
        }
    }

    const distinctValues = [...new Set(values)]
    const k = Math.min(numClasses, distinctValues.length)

    let classification
    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        classification = getEqualIntervals(minValue, maxValue, {
            numClasses: k,
            precision,
        })
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        classification = getQuantiles(values, { numClasses: k, precision })
    } else if (method === CLASSIFICATION_NATURAL_BREAKS_RANGES) {
        classification = getCkMeans(values, {
            numClasses: k,
            continuous: true,
            precision,
        })
    } else if (method === CLASSIFICATION_NATURAL_BREAKS_CLUSTERS) {
        classification = getCkMeans(values, {
            numClasses: k,
            continuous: false,
            precision,
        })
    } else if (method === CLASSIFICATION_STANDARD_DEVIATION) {
        classification = getStandardDeviation(values, { numClasses, precision })
    } else if (method === CLASSIFICATION_LOGARITHMIC) {
        const positiveValues = values.filter((v) => v > 0)
        if (positiveValues.length === 0) {
            return { items: [] }
        }
        classification = getLogarithmic(
            positiveValues[0],
            positiveValues.at(-1),
            {
                numClasses,
                precision,
            }
        )
    } else if (method === CLASSIFICATION_PRETTY_BREAKS) {
        classification = getPrettyBreaks(minValue, maxValue, {
            numClasses,
            precision,
        })
    }

    if (!classification) {
        return {}
    }
    return {
        items: classification.items.filter(
            (bin, index, arr) =>
                index === 0 ||
                bin.startValue !== arr[index - 1].startValue ||
                bin.endValue !== arr[index - 1].endValue
        ),
        valueFormat: classification.valueFormat,
    }
}

const getEqualIntervals = (minValue, maxValue, { numClasses, precision }) => {
    const items = []
    const classSize = (maxValue - minValue) / numClasses
    const resolvedPrecision = precision ?? precisionRound(classSize, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    for (let i = 0; i < numClasses; i++) {
        const startValue = minValue + i * classSize
        const endValue = i < numClasses - 1 ? startValue + classSize : maxValue

        items.push({
            startValue: valueFormat(startValue),
            endValue: valueFormat(endValue),
        })
    }

    return { items, valueFormat }
}

const getQuantiles = (values, { numClasses, precision }) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const items = []
    const valuesCount = values.length / numClasses
    const resolvedPrecision =
        precision ??
        precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    let lastValuePosition = valuesCount
    if (values.length > 0) {
        items[0] = minValue
        for (let i = 1; i < numClasses; i++) {
            items[i] = values[Math.round(lastValuePosition)]
            lastValuePosition += valuesCount
        }
    }

    // item can be undefined if few values
    return {
        items: items
            .filter((item) => item !== undefined)
            .map((value, index) => ({
                startValue: valueFormat(value),
                endValue: valueFormat(items[index + 1] || maxValue),
            })),
        valueFormat,
    }
}

const getCkMeans = (values, { numClasses, continuous, precision }) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const resolvedPrecision =
        precision ??
        precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    const k = Math.min(numClasses, values.length)
    const clusters = ckmeans(values, k)

    if (continuous) {
        // Continuous: midpoint between adjacent cluster bounds
        const boundaries = [
            minValue,
            ...clusters
                .slice(0, -1)
                .map(
                    (cluster, i) =>
                        (cluster[cluster.length - 1] + clusters[i + 1][0]) / 2
                ),
            maxValue,
        ]
        return {
            items: clusters.map((_, index) => ({
                startValue: valueFormat(boundaries[index]),
                endValue: valueFormat(boundaries[index + 1]),
            })),
            valueFormat,
        }
    }

    // Discrete (clusters): true cluster bounds, gaps allowed
    return {
        items: clusters.map((cluster) => ({
            startValue: valueFormat(cluster[0]),
            endValue: valueFormat(cluster[cluster.length - 1]),
        })),
        valueFormat,
    }
}

const getStandardDeviation = (values, { numClasses, precision }) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const mu = mean(values)
    const sigma = standardDeviation(values)
    const resolvedPrecision =
        precision ??
        precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    // Place breaks at 1-sigma intervals centered on the mean.
    const isEven = numClasses % 2 === 0
    const maxOffset = Math.floor((numClasses - 1) / 2)
    const internalBreaks = []
    for (let i = 0; i < numClasses - 1; i++) {
        let offset = i - maxOffset
        if (!isEven && offset >= 0) {
            offset += 1
        }
        internalBreaks.push(mu + offset * sigma)
    }

    // Outer bounds are σ-aligned so all class labels mean "Nσ from mean".
    // Values outside [lowerBound, upperBound] are routed to unclassified.
    const lowerBound = mu - (maxOffset + 1) * sigma
    const upperBound = mu + (maxOffset + 1) * sigma
    const allBreaks = [lowerBound, ...internalBreaks, upperBound]
    return {
        items: allBreaks.slice(0, -1).map((start, i) => ({
            startValue: valueFormat(start),
            endValue: valueFormat(allBreaks[i + 1]),
        })),
        valueFormat,
    }
}

const getLogarithmic = (minValue, maxValue, { numClasses, precision }) => {
    const logMin = Math.log(minValue)
    const logMax = Math.log(maxValue)
    const logStep = (logMax - logMin) / numClasses
    const resolvedPrecision =
        precision ??
        precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    const items = []
    for (let i = 0; i < numClasses; i++) {
        const startValue = Math.exp(logMin + i * logStep)
        const endValue =
            i < numClasses - 1 ? Math.exp(logMin + (i + 1) * logStep) : maxValue
        items.push({
            startValue: valueFormat(startValue),
            endValue: valueFormat(endValue),
        })
    }

    return { items, valueFormat }
}

const getPrettyBreaks = (minValue, maxValue, { numClasses, precision }) => {
    const range = maxValue - minValue
    const roughStep = range / numClasses
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
    const niceSteps = [1, 2, 5].map((n) => n * magnitude)
    const niceStep = niceSteps.findLast((s) => s <= roughStep) ?? niceSteps[0]

    const resolvedPrecision =
        precision ??
        precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    const internalBreaks = []
    let b = Math.ceil(minValue / niceStep) * niceStep
    if (b === minValue) {
        b += niceStep
    }
    while (b < maxValue && internalBreaks.length < numClasses - 1) {
        internalBreaks.push(b)
        b += niceStep
    }

    const allBreaks = [minValue, ...internalBreaks, maxValue]
    return {
        items: allBreaks.slice(0, -1).map((start, i) => ({
            startValue: valueFormat(start),
            endValue: valueFormat(allBreaks[i + 1]),
        })),
        valueFormat,
    }
}
