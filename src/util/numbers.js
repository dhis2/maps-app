import {
    DIGIT_GROUP_SEPARATOR_SPACE,
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
} from '../constants/settings.js'

export const formatCount = (count) => {
    let num

    if (count >= 1000 && count < 9500) {
        num = (count / 1000).toFixed(1) + 'k' // 3.3k
    } else if (count >= 9500 && count < 999500) {
        num = Math.round(count / 1000) + 'k' // 33k
    } else if (count >= 999500 && count < 1950000) {
        num = (count / 1000000).toFixed(1) + 'M' // 3.3M
    } else if (count > 1950000) {
        num = Math.round(count / 1000000) + 'M' // 33M
    }

    return num || count
}

// Returns a function that rounds number n to d decimals
export const getRoundToPrecisionFn = (d) => {
    if (d === undefined) {
        return (n) => n
    }
    const m = Math.pow(10, d)
    return (n) => Math.round(n * m) / m
}

// Returns the number of decimals to round a number to
export const getPrecision = (values = []) => {
    if (values.length) {
        const sortedValues = [...values].sort((a, b) => a - b)
        const minValue = sortedValues[0]
        const maxValue = sortedValues[sortedValues.length - 1]
        const minMaxGap = maxValue - minValue
        const absOfMaxValue = Math.abs(maxValue)

        if (absOfMaxValue >= 10000) {
            return 0
        }

        if (absOfMaxValue >= 1000) {
            return minMaxGap > 10 ? 0 : 1
        }

        if (absOfMaxValue >= 100) {
            return minMaxGap > 1 ? 1 : 2
        }

        if (absOfMaxValue >= 10) {
            return minMaxGap > 0.1 ? 2 : 3
        }

        if (absOfMaxValue >= 1) {
            return minMaxGap > 0.01 ? 3 : 4
        }

        return minMaxGap > 0.001 ? 4 : 5
    }

    return 0
}

const DIGIT_GROUP_SEPARATORS = {
    [DIGIT_GROUP_SEPARATOR_SPACE]: ' ',
    [DIGIT_GROUP_SEPARATOR_COMMA]: ',',
    [DIGIT_GROUP_SEPARATOR_NONE]: '',
}

export const formatWithSeparator = (
    value,
    separator,
    { force = false, precision } = {}
) => {
    if (!force && typeof value !== 'number') {
        return value
    }
    const sep = DIGIT_GROUP_SEPARATORS[separator] ?? ''
    const formatted =
        precision === undefined
            ? String(value)
            : Number(value).toFixed(precision)
    const [integer, decimal] = formatted.split('.')
    const isNegative = integer.startsWith('-')
    const digits = isNegative ? integer.slice(1) : integer
    const groups = []
    for (let i = digits.length; i > 0; i -= 3) {
        groups.unshift(digits.slice(Math.max(0, i - 3), i))
    }
    const grouped = (isNegative ? '-' : '') + groups.join(sep)
    return decimal ? `${grouped}.${decimal}` : grouped
}

export const parseWithSeparator = (value) => {
    const num = Number(String(value).replaceAll(/[\s,]/g, ''))
    return Number.isNaN(num) ? undefined : num
}
