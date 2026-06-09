import {
    DIGIT_GROUP_SEPARATOR_SPACE,
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
} from '../constants/settings.js'

export const MAX_LEGEND_VALUE_LENGTH = 11

export const SCIENTIFIC_SCALE = { scientific: true }

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

export const formatRangeWithSeparator = (
    { startValue, endValue },
    separator,
    { precision } = {}
) =>
    `${formatWithSeparator(startValue, separator, {
        precision,
    })} – ${formatWithSeparator(endValue, separator, { precision })}`

// Large-value scales (checked high→low so the biggest applicable unit wins).
// Values >= 1e12 use scientific notation instead of a suffix.
const LARGE_SCALES = [
    { factor: 1e12, scientific: true },
    { factor: 1e9, suffix: 'B' },
    { factor: 1e6, suffix: 'M' },
    { factor: 1e3, suffix: 'k' },
]

// Small-value scales (checked small→large so the smallest applicable unit wins).
// Values < 1e-11 use scientific notation instead of a suffix.
const SMALL_SCALES = [
    { factor: 1e-12, scientific: true, maxAbs: 1e-11 },
    { factor: 1e-9, suffix: 'n', maxAbs: 1e-8 },
    { factor: 1e-6, suffix: 'μ', maxAbs: 1e-5 },
    { factor: 1e-3, suffix: 'm', maxAbs: 1e-2 },
]

// Returns the compact scale that applies to an array of values, or null if none needed.
export const getCompactScale = (values) => {
    if (!values?.length) {
        return null
    }
    const absValues = values
        .filter((v) => typeof v === 'number' && Number.isFinite(v))
        .map(Math.abs)
    if (!absValues.length) {
        return null
    }

    const max = Math.max(...absValues)
    for (const scale of LARGE_SCALES) {
        if (max >= scale.factor) {
            return scale
        }
    }

    const nonZero = absValues.filter((v) => v > 0)
    if (nonZero.length) {
        const min = Math.min(...nonZero)
        for (const scale of SMALL_SCALES) {
            if (min < scale.maxAbs) {
                return scale
            }
        }
    }

    return null
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const toSuperscript = (n) =>
    String(Math.abs(n))
        .split('')
        .map((d) => SUPERSCRIPT[d])
        .join('')

// Returns the three parts of scientific notation for HTML rendering.
export const extractScientificParts = (value, decimalPlaces) => {
    const [mantissa, expStr] = value
        .toExponential(decimalPlaces ?? 1)
        .split('e')
    const exp = parseInt(expStr, 10)
    return {
        mantissa,
        sign: exp < 0 ? '-' : '+',
        exponent: String(Math.abs(exp)),
    }
}

// Formats value using a compact scale. decimalPlaces defaults to 2 with trailing zeros
// preserved for alignment. When scale is null, falls back to formatWithSeparator.
// Scientific notation scales (scale.scientific) format as e.g. "1.2×10¹⁸".
export const formatCompact = (
    value,
    scale,
    { decimalPlaces, separator } = {}
) => {
    if (!scale) {
        return formatWithSeparator(value, separator, {
            precision: decimalPlaces,
        })
    }
    if (scale.scientific) {
        const [mantissa, expStr] = value
            .toExponential(decimalPlaces ?? 1)
            .split('e')
        const exp = parseInt(expStr, 10)
        return `${mantissa}E${exp < 0 ? '⁻' : '⁺'}${toSuperscript(exp)}`
    }
    const scaled = value / scale.factor
    return `${formatWithSeparator(scaled, separator, {
        precision: decimalPlaces ?? 1,
    })}${scale.suffix}`
}

// For features count legend and map cluster labels (except donuts handled by maps-gl).
// Returns a compact string ("3.3k", "1.3M" …) for counts >= 1000,
// or the original number for smaller values.
export const formatCount = (count) => {
    let num

    if (count >= 1000 && count < 9500) {
        num = (count / 1000).toFixed(1) + 'k' // 3.3k
    } else if (count >= 9500 && count < 999500) {
        num = Math.round(count / 1000) + 'k' // 33k
    } else if (count >= 999500 && count < 1950000) {
        num = (count / 1000000).toFixed(1) + 'M' // 1.3M
    } else if (count >= 1950000 && count < 999500000) {
        num = Math.round(count / 1000000) + 'M' // 33M
    } else if (count >= 999500000 && count < 1950000000) {
        num = (count / 1000000000).toFixed(1) + 'B' // 1.3B
    } else if (count >= 1950000000) {
        num = Math.round(count / 1000000000) + 'B' // 33B
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

export const parseWithSeparator = (value) => {
    const num = Number(String(value).replaceAll(/[\s,]/g, ''))
    return Number.isNaN(num) ? undefined : num
}
