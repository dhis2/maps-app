// Utils for thematic mapping
import { precisionRound } from 'd3-format'
import { ckmeans } from 'simple-statistics'
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
    CLASSIFICATION_NATURAL_BREAKS_RANGES,
    CLASSIFICATION_NATURAL_BREAKS_CLUSTERS,
    getClassificationTypes,
} from '../constants/layers.js'
import { hasValue } from './helpers.js'
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
    if (valueFormat) {
        value = valueFormat(value)
    }

    if (clamp) {
        if (value < legendItems[0].startValue) {
            return legendItems[0]
        }
        if (value > legendItems[legendItems.length - 1].endValue) {
            return legendItems[legendItems.length - 1]
        }
    }

    const isClusters = method === CLASSIFICATION_NATURAL_BREAKS_CLUSTERS

    const isLast = (index) => index === legendItems.length - 1
    return legendItems.find((item, index) =>
        item.startValue == item.endValue
            ? value == item.startValue
            : value >= item.startValue &&
              (value < item.endValue ||
                  (value === item.endValue && (isClusters || isLast(index))))
    )
}

export const getLegendItems = (
    values,
    method,
    { numClasses, precision } = {}
) => {
    if (
        !getClassificationTypes()
            .map(({ id }) => id)
            .includes(method)
    ) {
        return {}
    }
    const minValue = values[0]
    const maxValue = values[values.length - 1]

    if (minValue === maxValue) {
        return {
            items: [{ startValue: minValue, endValue: maxValue }],
        }
    }

    const distinctValues = [...new Set(values)]
    const k = Math.min(numClasses, distinctValues.length)
    const hasInsufficientValues = k < numClasses
    if (hasInsufficientValues && method !== CLASSIFICATION_EQUAL_INTERVALS) {
        method = CLASSIFICATION_NATURAL_BREAKS_CLUSTERS
    }

    let classification
    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        classification = getEqualIntervals(minValue, maxValue, {
            numClasses,
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
    const binSize = (maxValue - minValue) / numClasses
    const resolvedPrecision =
        precision !== undefined ? precision : precisionRound(binSize, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    for (let i = 0; i < numClasses; i++) {
        const startValue = minValue + i * binSize
        const endValue = i < numClasses - 1 ? startValue + binSize : maxValue

        items.push({
            startValue: valueFormat(startValue),
            endValue: valueFormat(endValue),
        })
    }

    return {
        items,
        valueFormat,
    }
}

const getQuantiles = (values, { numClasses, precision }) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const items = []
    const binCount = values.length / numClasses
    const resolvedPrecision =
        precision !== undefined
            ? precision
            : precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    let binLastValPos = binCount === 0 ? 0 : binCount

    if (values.length > 0) {
        items[0] = minValue
        for (let i = 1; i < numClasses; i++) {
            items[i] = values[Math.round(binLastValPos)]
            binLastValPos += binCount
        }
    }

    // bin can be undefined if few values
    return {
        items: items
            .filter((bin) => bin !== undefined)
            .map((value, index) => ({
                startValue: valueFormat(value),
                endValue: valueFormat(items[index + 1] || maxValue),
            })),
        valueFormat,
    }
}

const getCkMeans = (values, { numClasses, continuous = false, precision }) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const resolvedPrecision =
        precision !== undefined
            ? precision
            : precisionRound((maxValue - minValue) / numClasses, maxValue)
    const valueFormat = getRoundToPrecisionFn(resolvedPrecision)

    const k = Math.min(numClasses, values.length)
    const clusters = ckmeans(values, k)

    return {
        items: clusters.map((cluster, index) => ({
            startValue: valueFormat(cluster[0]),
            endValue: valueFormat(
                continuous && index < clusters.length - 1
                    ? clusters[index + 1][0]
                    : cluster[cluster.length - 1]
            ),
        })),
        valueFormat,
    }
}
