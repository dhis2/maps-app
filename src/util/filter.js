import i18n from '@dhis2/d2-i18n'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    FILTER_TEXT,
    FILTER_NUMBER,
    FILTER_OPTIONS,
    FILTER_DATE,
    OPERATOR_EQUAL,
    OPERATOR_NOT_EQUAL,
    OPERATOR_GREATER,
    OPERATOR_GREATER_OR_EQUAL,
    OPERATOR_LESS,
    OPERATOR_LESS_OR_EQUAL,
    OPERATOR_BETWEEN,
    OPERATOR_EMPTY,
    OPERATOR_NOT_EMPTY,
} from '../constants/dataTable.js'

export const isOrgUnitValueFilter = (filter) =>
    filter != null &&
    typeof filter === 'object' &&
    !Array.isArray(filter) &&
    Array.isArray(filter.values) &&
    filter.searchDerived === true

// Filters an array of object with a set of filters
export const filterData = (data, filters) => {
    if (!filters) {
        return data
    }

    let filteredData = [...data]

    Object.keys(filters).forEach((field) => {
        // Loop through all filters
        const filter = filters[field]

        filteredData = filteredData.filter((d) => {
            // Loop through all data items
            const props = d.properties || d // GeoJSON or plain object
            const value = props[field]

            if (filter?.type) {
                return matchesFilter(value, filter)
            }

            const stringValue =
                value == null ? SENTINEL_NO_VALUE : String(value)

            if (isOrgUnitValueFilter(filter)) {
                return filter.values.includes(stringValue)
            }

            if (Array.isArray(filter)) {
                // Multi-select: OR match against the raw stored value
                return (
                    filter.length === 0 ||
                    filter.includes(stringValue) ||
                    (stringValue !== SENTINEL_NO_VALUE &&
                        filter.includes(SENTINEL_ANY_VALUE))
                )
            }

            return typeof value === 'number'
                ? numericFilter(value, filter)
                : stringFilter(value, filter)
        })
    })

    return filteredData
}

// Option values are compared as strings, missing values as SENTINEL_NO_VALUE
export const toOptionValue = (value) =>
    value == null ? SENTINEL_NO_VALUE : String(value)

const isEmptyValue = (value) => value == null || String(value).trim() === ''

const numberOperators = {
    [OPERATOR_EQUAL]: (number, a) => number === a,
    [OPERATOR_NOT_EQUAL]: (number, a) => number !== a,
    [OPERATOR_GREATER]: (number, a) => number > a,
    [OPERATOR_GREATER_OR_EQUAL]: (number, a) => number >= a,
    [OPERATOR_LESS]: (number, a) => number < a,
    [OPERATOR_LESS_OR_EQUAL]: (number, a) => number <= a,
    [OPERATOR_BETWEEN]: (number, a, b) =>
        number >= Math.min(a, b) && number <= Math.max(a, b),
}

const matchesNumber = (value, { operator, value: a, value2: b }) => {
    const number = Number(value)
    if (isEmptyValue(value) || Number.isNaN(number)) {
        return false
    }
    return numberOperators[operator]?.(number, Number(a), Number(b)) ?? true
}

// Dates are compared on their first 10 characters (YYYY-MM-DD)
const matchesDate = (value, { from, to }) => {
    if (isEmptyValue(value)) {
        return false
    }
    const date = String(value).slice(0, 10)
    return (!from || date >= from) && (!to || date <= to)
}

// Filters set from the data table's column filter popovers
export const matchesFilter = (value, filter) => {
    if (filter.operator === OPERATOR_EMPTY) {
        return isEmptyValue(value)
    }
    if (filter.operator === OPERATOR_NOT_EMPTY) {
        return !isEmptyValue(value)
    }
    switch (filter.type) {
        case FILTER_TEXT:
            return stringFilter(value ?? '', filter.value)
        case FILTER_NUMBER:
            return matchesNumber(value, filter)
        case FILTER_OPTIONS:
            return filter.values.includes(toOptionValue(value))
        case FILTER_DATE:
            return matchesDate(value, filter)
        default:
            return true
    }
}

// Simple check if string contains another string
export const stringFilter = (string, filter) => {
    return ('' + string).toLowerCase().includes(filter.toLowerCase())
}

// Numeric filter supporting AND, OR, GREATER THAN, LESS THAN or equal number
export const numericFilter = (value, filter) => {
    // TODO: Syntax error handling
    return filter.split(',').some((orFilter) => {
        // OR filter
        return orFilter
            .split('&')
            .every((filter) => isTrueFilter(value, filter)) // AND filter
    })
}

// Returns true if the filter is true
const isTrueFilter = (value, filter) => {
    if (filter.includes('>=')) {
        return value >= Number(filter.split('>=')[1])
    }

    if (filter.includes('<=')) {
        return value <= Number(filter.split('<=')[1])
    }

    if (filter.includes('>')) {
        return value > Number(filter.split('>')[1])
    }

    if (filter.includes('<')) {
        return value < Number(filter.split('<')[1])
    }

    return value === Number(filter) // Equal number
}

export const isValuelessFilter = (filter) =>
    filter?.operator === OPERATOR_EMPTY ||
    filter?.operator === OPERATOR_NOT_EMPTY

// A draft that would keep every row is no filter
export const isEmptyFilter = (filter) => {
    if (!filter) {
        return true
    }
    if (isValuelessFilter(filter)) {
        return false
    }
    switch (filter.type) {
        case FILTER_TEXT:
            return isEmptyValue(filter.value)
        case FILTER_NUMBER:
            return isEmptyValue(filter.value) && isEmptyValue(filter.value2)
        case FILTER_OPTIONS:
            return !filter.values?.length
        case FILTER_DATE:
            return !filter.from && !filter.to
        default:
            return true
    }
}

const isBetweenNumbers = (filter) =>
    filter?.type === FILTER_NUMBER && filter.operator === OPERATOR_BETWEEN

// Shown under the second input of a range
export const getFilterError = (filter) => {
    if (
        isBetweenNumbers(filter) &&
        !isEmptyValue(filter.value) &&
        !isEmptyValue(filter.value2) &&
        Number(filter.value) > Number(filter.value2)
    ) {
        return i18n.t('Max must be greater than Min')
    }
    if (
        filter?.type === FILTER_DATE &&
        filter.from &&
        filter.to &&
        filter.from > filter.to
    ) {
        return i18n.t('To must be after From')
    }
    return null
}

// A range needs both bounds before it can be applied
export const isValidFilter = (filter) =>
    !(
        isBetweenNumbers(filter) &&
        isEmptyValue(filter.value) !== isEmptyValue(filter.value2)
    ) && !getFilterError(filter)

const normalizeFilter = (filter) => {
    if (isEmptyFilter(filter)) {
        return null
    }
    if (isValuelessFilter(filter)) {
        return { type: filter.type, operator: filter.operator }
    }
    switch (filter.type) {
        case FILTER_NUMBER:
            return {
                type: filter.type,
                operator: filter.operator,
                value: String(filter.value),
                value2: isBetweenNumbers(filter)
                    ? String(filter.value2)
                    : undefined,
            }
        case FILTER_OPTIONS: {
            const values = [...filter.values]
            values.sort((a, b) => a.localeCompare(b))
            return { type: filter.type, values }
        }
        case FILTER_DATE:
            return {
                type: filter.type,
                from: filter.from || undefined,
                to: filter.to || undefined,
            }
        default:
            return { type: filter.type, value: filter.value }
    }
}

// Tells whether applying a draft would change the column's filter
export const isSameFilter = (a, b) =>
    JSON.stringify(normalizeFilter(a)) === JSON.stringify(normalizeFilter(b))
