// Utils for thematic mapping
import { precisionRound } from 'd3-format'
import {
    CLASSIFICATION_EQUAL_INTERVALS,
    CLASSIFICATION_EQUAL_COUNTS,
} from '../constants/layers.js'
import { getRoundToPrecisionFn } from './numbers.js'

// Returns legend item where a value belongs
export const getLegendItemForValue = (legendItems, value, clamp = false) => {
    if (legendItems.length === 0) {
        return []
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
    let bins

    if (method === CLASSIFICATION_EQUAL_INTERVALS) {
        bins = getEqualIntervals(minValue, maxValue, numClasses)
    } else if (method === CLASSIFICATION_EQUAL_COUNTS) {
        bins = getQuantiles(values, numClasses)
    }

    return bins
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
    const bins = []
    const binSize = (maxValue - minValue) / numClasses
    const precision = precisionRound(binSize, maxValue)
    const valueFormat = getRoundToPrecisionFn(precision)

    for (let i = 0; i < numClasses; i++) {
        const startValue = minValue + i * binSize
        const endValue = i < numClasses - 1 ? startValue + binSize : maxValue

        bins.push({
            startValue: valueFormat(startValue),
            endValue: valueFormat(endValue),
        })
    }

    return bins
}

const getQuantiles = (values, numClasses) => {
    const minValue = values[0]
    const maxValue = values[values.length - 1]
    const bins = []
    const binCount = values.length / numClasses
    const precision = precisionRound(
        (maxValue - minValue) / numClasses,
        maxValue
    )
    const valueFormat = getRoundToPrecisionFn(precision)

    let binLastValPos = binCount === 0 ? 0 : binCount

    if (values.length > 0) {
        bins[0] = minValue
        for (let i = 1; i < numClasses; i++) {
            bins[i] = values[Math.round(binLastValPos)]
            binLastValPos += binCount
        }
    }

    // bin can be undefined if few values
    return bins
        .filter((bin) => bin !== undefined)
        .map((value, index) => ({
            startValue: valueFormat(value),
            endValue: valueFormat(bins[index + 1] || maxValue),
        }))
}
