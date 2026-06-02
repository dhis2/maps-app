// Utils for thematic mapping
import { precisionRound } from 'd3-format'
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
} from '../constants/layers.js'
import { hasValue } from './helpers.js'
import { getRoundToPrecisionFn } from './numbers.js'

// Returns legend item where a value belongs
export const getLegendItemForValue = ({
    value,
    valueFormat,
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

    const isLast = (index) => index === legendItems.length - 1
    return legendItems.find(
        (item, index) =>
            value >= item.startValue &&
            (value < item.endValue || (isLast(index) && value == item.endValue))
    )
}

export const getLegendItems = (values, method, numClasses) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    let classification

    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        classification = getEqualIntervals(minValue, maxValue, numClasses)
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        classification = getQuantiles(values, numClasses)
    }

    return classification ?? {}
}

// This function is not in use, but keeping it
// just in case it's needed in the future
// export const getClassBins = (values, method, numClasses) => {
//     const minValue = values[0]
//     const maxValue = values[values.length - 1]
//     let bins

//     if (method === CLASSIFICATION_EQUAL_INTERVALS) {
//         bins = getEqualIntervals(minValue, maxValue, numClasses)
//     } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
//         bins = getQuantiles(values, numClasses)
//     }

//     return bins
// }

const getEqualIntervals = (minValue, maxValue, numClasses) => {
    const items = []
    const classSize = (maxValue - minValue) / numClasses
    const precision = precisionRound(classSize, maxValue)
    const valueFormat = getRoundToPrecisionFn(precision)

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

const getQuantiles = (values, numClasses) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const items = []
    const valuesCount = values.length / numClasses
    const precision = precisionRound(
        (maxValue - minValue) / numClasses,
        maxValue
    )
    const valueFormat = getRoundToPrecisionFn(precision)

    let lastValuePosition = valuesCount
    if (values.length > 0) {
        items[0] = minValue
        for (let i = 1; i < numClasses; i++) {
            items[i] = values[Math.round(lastValuePosition)]
            lastValuePosition += valuesCount
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
