import i18n from '@dhis2/d2-i18n'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    FILTER_TEXT,
    FILTER_NUMBER,
    FILTER_DATE,
    FILTER_TIME,
    OPERATOR_CONTAINS,
    OPERATOR_NOT_CONTAINS,
    OPERATOR_IS,
    OPERATOR_STARTS_WITH,
    OPERATOR_EQUAL,
    OPERATOR_NOT_EQUAL,
    OPERATOR_GREATER,
    OPERATOR_GREATER_OR_EQUAL,
    OPERATOR_LESS,
    OPERATOR_LESS_OR_EQUAL,
    OPERATOR_BETWEEN,
    OPERATOR_ON,
    OPERATOR_BEFORE,
    OPERATOR_AFTER,
} from '../constants/dataTable.js'

// A column filter is { type, operator, value, value2, excluded, excludedByCondition }:
// a condition on the column's values, and the values unchecked in its list.
// Columns whose cells show a name instead of the value (org units, options)
// store their condition as excludedByCondition, the values it leaves out,
// so the map can apply it without the names.

// "No value": missing, empty or blank text, or a number that isn't one
export const isEmptyValue = (value) => {
    if (value == null) {
        return true
    }
    if (typeof value === 'number') {
        return Number.isNaN(value)
    }
    return String(value).trim() === ''
}

// A value's key in a filter's list of values, the same for every missing value
export const toFilterKey = (value) =>
    isEmptyValue(value) ? SENTINEL_NO_VALUE : String(value)

// Text compared without case or accents
export const normalizeText = (text) =>
    String(text)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim()

const textOperators = {
    [OPERATOR_CONTAINS]: (text, query) => text.includes(query),
    [OPERATOR_NOT_CONTAINS]: (text, query) => !text.includes(query),
    [OPERATOR_IS]: (text, query) => text === query,
    [OPERATOR_STARTS_WITH]: (text, query) => text.startsWith(query),
}

const numberOperators = {
    [OPERATOR_EQUAL]: (number, a) => number === a,
    [OPERATOR_NOT_EQUAL]: (number, a) => number !== a,
    [OPERATOR_GREATER]: (number, a) => number > a,
    [OPERATOR_GREATER_OR_EQUAL]: (number, a) => number >= a,
    [OPERATOR_LESS]: (number, a) => number < a,
    [OPERATOR_LESS_OR_EQUAL]: (number, a) => number <= a,
    [OPERATOR_BETWEEN]: (number, a, b) => number >= a && number <= b,
}

// Dates and times compare as text: YYYY-MM-DD (by day) and HH:MM
const orderedOperators = {
    [OPERATOR_ON]: (text, a) => text === a,
    [OPERATOR_BEFORE]: (text, a) => text < a,
    [OPERATOR_AFTER]: (text, a) => text > a,
    [OPERATOR_BETWEEN]: (text, a, b) => text >= a && text <= b,
}

const operatorsByType = {
    [FILTER_TEXT]: textOperators,
    [FILTER_NUMBER]: numberOperators,
    [FILTER_DATE]: orderedOperators,
    [FILTER_TIME]: orderedOperators,
}

const COMPARED_LENGTH = { [FILTER_DATE]: 10, [FILTER_TIME]: 5 }

const isBlank = (text) => text == null || String(text).trim() === ''

const needsSecondValue = (filter) => filter.operator === OPERATOR_BETWEEN

// Whether the filter has a complete condition (Between needs both values)
export const hasCondition = (filter) =>
    !!operatorsByType[filter?.type]?.[filter.operator] &&
    !isBlank(filter.value) &&
    (!needsSecondValue(filter) || !isBlank(filter.value2))

const toComparedText = (value, type) =>
    String(value).trim().slice(0, COMPARED_LENGTH[type])

// The condition as a test on one value, prepared once per filter; null without one
export const getConditionTest = (filter) => {
    if (!hasCondition(filter)) {
        return null
    }
    const { type, operator, value, value2 } = filter
    const test = operatorsByType[type][operator]

    if (type === FILTER_NUMBER) {
        const a = Number(value)
        const b = Number(value2)
        return (cell) => test(Number(cell), a, b)
    }
    if (type === FILTER_TEXT) {
        const query = normalizeText(value)
        return (cell) => test(normalizeText(cell), query)
    }
    const a = toComparedText(value, type)
    const b = toComparedText(value2 ?? '', type)
    return (cell) => test(toComparedText(cell, type), a, b)
}

// Rows without a value follow the "No value" checkbox, whatever the condition
const prepareColumnFilter = (filter) => {
    const excluded = new Set([
        ...(filter.excluded ?? []),
        ...(filter.excludedByCondition ?? []),
    ])
    const condition = filter.excludedByCondition
        ? null
        : getConditionTest(filter)

    return (value) => {
        const key = toFilterKey(value)
        if (excluded.has(key)) {
            return false
        }
        return key === SENTINEL_NO_VALUE || !condition || condition(value)
    }
}

export const isOrgUnitValueFilter = (filter) =>
    filter != null &&
    typeof filter === 'object' &&
    !Array.isArray(filter) &&
    Array.isArray(filter.values) &&
    filter.searchDerived === true

// Simple check if string contains another string
export const stringFilter = (string, filter) => {
    return ('' + string).toLowerCase().includes(filter.toLowerCase())
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

// The search fields under the column names, until every column has a filter button
const prepareSearchFieldFilter = (filter) => (value) => {
    const stringValue = value == null ? SENTINEL_NO_VALUE : String(value)

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
}

const prepareFilter = (filter) =>
    filter?.type
        ? prepareColumnFilter(filter)
        : prepareSearchFieldFilter(filter)

// Whether one value passes a filter
export const matchesFilter = (value, filter) => prepareFilter(filter)(value)

// The rows (or GeoJSON features) that pass every filter, each filter prepared once
export const filterData = (data, filters) => {
    if (!filters) {
        return data
    }

    const tests = Object.entries(filters)
        .filter(([, filter]) => filter != null)
        .map(([field, filter]) => [field, prepareFilter(filter)])

    return data.filter((d) => {
        const props = d.properties || d // GeoJSON or plain object
        return tests.every(([field, test]) => test(props[field]))
    })
}

// A filter that would keep every row
export const isEmptyFilter = (filter) =>
    !filter ||
    (!hasCondition(filter) &&
        !filter.excluded?.length &&
        !filter.excludedByCondition?.length)

const BOUNDS_ERRORS = {
    [FILTER_NUMBER]: () =>
        i18n.t('The second number must be greater than the first'),
    [FILTER_DATE]: () => i18n.t('The end date must be after the start date'),
    [FILTER_TIME]: () => i18n.t('The end time must be after the start time'),
}

const isNotNumber = (text) => !isBlank(text) && Number.isNaN(Number(text))

const areBoundsReversed = ({ type, value, value2 }) => {
    if (type === FILTER_NUMBER) {
        return Number(value) > Number(value2)
    }
    return toComparedText(value, type) > toComparedText(value2, type)
}

// Shown under the inputs; a filter with an error can't be applied
export const getFilterError = (filter) => {
    if (!filter?.operator) {
        return null
    }
    if (
        filter.type === FILTER_NUMBER &&
        (isNotNumber(filter.value) || isNotNumber(filter.value2))
    ) {
        return i18n.t('Enter a number')
    }
    if (!needsSecondValue(filter)) {
        return null
    }
    if (isBlank(filter.value) !== isBlank(filter.value2)) {
        return i18n.t('Fill in both values')
    }
    if (!isBlank(filter.value) && areBoundsReversed(filter)) {
        return BOUNDS_ERRORS[filter.type]?.() ?? null
    }
    return null
}

const sortedKeys = (keys) =>
    [...(keys ?? [])].sort((a, b) => a.localeCompare(b))

// The filter as stored: no empty condition, values sorted
export const normalizeFilter = (filter) => {
    if (isEmptyFilter(filter)) {
        return null
    }
    const normalized = {
        type: filter.type,
        excluded: sortedKeys(filter.excluded),
    }
    if (hasCondition(filter)) {
        normalized.operator = filter.operator
        normalized.value = String(filter.value).trim()
        if (needsSecondValue(filter)) {
            normalized.value2 = String(filter.value2).trim()
        }
    }
    if (filter.excludedByCondition) {
        normalized.excludedByCondition = sortedKeys(filter.excludedByCondition)
    }
    return normalized
}

// Tells whether applying a draft would change the column's filter
export const isSameFilter = (a, b) =>
    JSON.stringify(normalizeFilter(a)) === JSON.stringify(normalizeFilter(b))
