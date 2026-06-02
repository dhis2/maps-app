import i18n from '@dhis2/d2-i18n'
import { precisionRound } from 'd3-format'
import {
    digitWidth,
    guideLength,
    textPadding,
} from '../components/legend/Bubbles.jsx'
import { getContrastColor } from './colors.js'
import { getLongestTextLength } from './helpers.js'
import { formatWithSeparator, getRoundToPrecisionFn } from './numbers.js'

const getBubbleValueFormat = ({ minValue, maxValue, divisor }) => {
    if (minValue === maxValue) {
        return (n) => n.toString()
    }
    const precision = precisionRound((maxValue - minValue) / divisor, maxValue)
    return (n) => getRoundToPrecisionFn(precision)(n).toString()
}

export const createBubbleItems = ({
    classes,
    minValue,
    maxValue,
    scale,
    radiusHigh,
}) => {
    const valueFormat = getBubbleValueFormat({
        minValue,
        maxValue,
        divisor: classes.length,
    })

    const startValue = classes[0].startValue
    const endValue = classes[classes.length - 1].endValue
    const itemScale = scale.domain([startValue, endValue])

    const bubbles = [...classes].reverse().map((c) => ({
        radius: itemScale(c.endValue),
        maxRadius: radiusHigh,
        color: c.color,
        text: valueFormat(c.endValue),
    }))

    if (minValue === maxValue) {
        return bubbles
    }

    bubbles.push({
        radius: itemScale(startValue),
        maxRadius: radiusHigh,
        text: valueFormat(startValue),
    })

    return bubbles
}

export const createSingleColorBubbles = ({
    color,
    minValue,
    maxValue,
    scale,
    radiusLow,
    radiusHigh,
}) => {
    const valueFormat = getBubbleValueFormat({ minValue, maxValue, divisor: 3 })

    const stroke = color && getContrastColor(color)
    const itemScale = scale.domain([minValue, maxValue])

    if (minValue === maxValue) {
        return [
            {
                radius: itemScale(minValue),
                maxRadius: radiusHigh,
                color,
                stroke,
                text: valueFormat(minValue),
            },
        ]
    }

    const midValue = (maxValue + minValue) / 2

    return [
        {
            radius: radiusHigh,
            maxRadius: radiusHigh,
            color,
            stroke,
            text: valueFormat(maxValue) || i18n.t('Max'),
        },
        {
            radius: itemScale(midValue),
            maxRadius: radiusHigh,
            color,
            stroke,
            text: valueFormat(midValue) || i18n.t('Mid'),
        },
        {
            radius: radiusLow,
            maxRadius: radiusHigh,
            color,
            stroke,
            text: valueFormat(minValue) || i18n.t('Min'),
        },
    ]
}

export const computeLayout = ({
    bubbles,
    bubbleClasses,
    radiusHigh,
    legendWidth,
    keyAnalysisDigitGroupSeparator,
}) => {
    // Calculate the pixel length of the longest formatted number
    const formattedLen = (v) =>
        typeof v === 'number'
            ? formatWithSeparator(v, keyAnalysisDigitGroupSeparator).length
            : 0
    let textLength = Math.ceil(
        Math.max(
            0,
            ...bubbleClasses.map((c) => formattedLen(c.startValue)),
            ...bubbleClasses.map((c) => formattedLen(c.endValue))
        ) * digitWidth
    )

    // Calculate the total length if numbers are alternate on each side
    const alternateLength =
        (radiusHigh + guideLength + textPadding + textLength) * 2

    let smallestGap = bubbles.reduce((prev, curr, i) => {
        const gap = prev.radius - curr.radius
        const smallestGap =
            prev.gap === undefined || gap < prev.gap ? gap : prev.gap

        return i === bubbles.length - 1
            ? Math.round(smallestGap * 2)
            : {
                  radius: curr.radius,
                  gap: smallestGap,
              }
    })

    const alternateFit = alternateLength < legendWidth
    const alternate = alternateFit && smallestGap > 5 && smallestGap < 12

    if (!alternateFit) {
        smallestGap = smallestGap / 2
    }

    // Too cramped to show number for each bubble
    let showNumbers
    if (smallestGap < 6) {
        const [maxBubble] = bubbles
        const minBubble = bubbles[bubbles.length - 1]
        const gap = maxBubble.radius - minBubble.radius
        showNumbers = [0] // Always show largest number

        if (gap > 6) {
            showNumbers.push(bubbles.length - 1)
        }

        if (gap > 15) {
            const midRadius = minBubble.radius + gap / 2

            // Find the closest bubble above the mid radius
            const midBubble = bubbles.reduce((prev, curr) =>
                curr.radius >= midRadius &&
                curr.radius - midRadius < prev.radius - midRadius
                    ? curr
                    : prev
            )

            showNumbers.push(bubbles.indexOf(midBubble))
        }
    }

    const bubblesWithVisibleText = Array.isArray(showNumbers)
        ? showNumbers.map((i) => bubbles[i])
        : bubbles
    textLength = Math.ceil(
        getLongestTextLength(bubblesWithVisibleText, 'text') * digitWidth
    )

    const offset = textLength + guideLength + textPadding

    return {
        alternate,
        offset,
        showNumbers,
    }
}
