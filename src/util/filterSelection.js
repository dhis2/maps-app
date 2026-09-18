import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
} from '../constants/dataTable.js'

export const getInvertibleValues = (hasNotSetOption, realValues) =>
    hasNotSetOption ? [SENTINEL_NO_VALUE, ...realValues] : realValues

export const toggleAnyValue = (selected) => {
    const anyValueActive = selected.includes(SENTINEL_ANY_VALUE)
    const keepNotSet = selected.includes(SENTINEL_NO_VALUE)
    if (anyValueActive) {
        return keepNotSet ? [SENTINEL_NO_VALUE] : []
    }
    return keepNotSet
        ? [SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE]
        : [SENTINEL_ANY_VALUE]
}

export const toggleRealValue = (selected, value, realValues) => {
    const anyValueActive = selected.includes(SENTINEL_ANY_VALUE)
    const keepNotSet = selected.includes(SENTINEL_NO_VALUE)

    if (anyValueActive) {
        const next = realValues.filter((v) => v !== value)
        return keepNotSet ? [...next, SENTINEL_NO_VALUE] : next
    }

    const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]

    const allRealValuesChecked =
        realValues.length > 0 && realValues.every((v) => next.includes(v))
    if (!allRealValuesChecked) {
        return next
    }
    return next.includes(SENTINEL_NO_VALUE)
        ? [SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE]
        : [SENTINEL_ANY_VALUE]
}

export const reverseSelection = (selected, realValues, hasNotSetOption) => {
    const anyValueActive = selected.includes(SENTINEL_ANY_VALUE)

    const invertedRealValues = anyValueActive
        ? []
        : realValues.filter((v) => !selected.includes(v))
    const invertedNotSet =
        hasNotSetOption && !selected.includes(SENTINEL_NO_VALUE)

    const allRealValuesInverted =
        !anyValueActive &&
        realValues.length > 0 &&
        invertedRealValues.length === realValues.length

    if (allRealValuesInverted) {
        return invertedNotSet
            ? [SENTINEL_ANY_VALUE, SENTINEL_NO_VALUE]
            : [SENTINEL_ANY_VALUE]
    }

    return invertedNotSet
        ? [SENTINEL_NO_VALUE, ...invertedRealValues]
        : invertedRealValues
}
