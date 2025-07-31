import i18n from '@dhis2/d2-i18n'
import { precisionRound } from 'd3-format'
import {
    digitWidth,
    guideLength,
    textPadding,
} from '../components/legend/Bubbles.jsx'
import { getContrastColor } from './colors.js'
import { getLongestTextLength } from './helpers.js'
import { getRoundToPrecisionFn } from './numbers.js'

export const createBubbleItems = ({
    classes,
    minValue,
    maxValue,
    scale,
    radiusHigh,
}) => {
    const binSize = (maxValue - minValue) / classes.length
    const precision = precisionRound(binSize, maxValue)
    const valueFormat = (n) => getRoundToPrecisionFn(precision)(n).toString()

    const startValue = classes[0].startValue
    const endValue = classes[classes.length - 1].endValue
    const itemScale = scale.domain([startValue, endValue])

    const bubbles = [...classes].reverse().map((c) => ({
        radius: itemScale(c.endValue),
        maxRadius: radiusHigh,
        color: c.color,
        text: valueFormat(c.endValue),
    }))

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
    const binSize = (maxValue - minValue) / 3
    const precision = precisionRound(binSize, maxValue)
    const valueFormat = (n) => getRoundToPrecisionFn(precision)(n).toString()

    const stroke = color && getContrastColor(color)
    const itemScale = scale.domain([minValue, maxValue])
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
}) => {
    // Calculate the pixel length of the longest number
    let textLength = Math.ceil(
        Math.max(
            getLongestTextLength(bubbleClasses, 'startValue'),
            getLongestTextLength(bubbleClasses, 'endValue')
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
