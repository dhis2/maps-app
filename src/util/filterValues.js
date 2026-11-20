import { OPERATOR_FIND, SENTINEL_NO_VALUE } from '../constants/dataTable.js'
import {
    filterData,
    getConditionTest,
    hasCondition,
    normalizeText,
    toFilterKey,
} from './filter.js'
import { compareColumnOptionValues } from './tableSort.js'

// The list of values in a column's filter popover: what it lists, the rows it keeps,
// and the filter it applies

const compareEntries = (header, byLabel) => (a, b) => {
    if (
        !byLabel ||
        a.key === SENTINEL_NO_VALUE ||
        b.key === SENTINEL_NO_VALUE
    ) {
        return compareColumnOptionValues(a.key, b.key, header)
    }
    return a.label.localeCompare(b.label)
}

// Each value of a column with its label and row count, "No value" first
export const countColumnValues = (rows, { header, getLabel, byLabel }) => {
    const byKey = new Map([
        [SENTINEL_NO_VALUE, { key: SENTINEL_NO_VALUE, label: '', count: 0 }],
    ])
    for (const row of rows) {
        const value = row[header.dataKey]
        const key = toFilterKey(value)
        const entry = byKey.get(key)
        if (entry) {
            entry.count++
        } else {
            byKey.set(key, {
                key,
                value,
                label: getLabel(value, row),
                count: 1,
            })
        }
    }
    return [...byKey.values()].sort(compareEntries(header, byLabel))
}

// The rows the other columns' filters keep, which the list counts
export const getRowsForColumn = (rows, filters, dataKey) => {
    const otherFilters = { ...filters }
    delete otherFilters[dataKey]
    return filterData(rows, otherFilters)
}

// The draft's condition on a listed value: on its label where cells show a name
const getEntryTest = (draft, matchOnLabel) => {
    const test = getConditionTest(draft)
    if (!test) {
        return null
    }
    return (entry) => test(matchOnLabel ? entry.label : entry.value)
}

const getFindText = (draft) =>
    draft.operator === OPERATOR_FIND ? normalizeText(draft.value ?? '') : ''

// The values to list: those passing the condition, or found by "Find in list",
// with "No value" and the unchecked values no row has any more
export const getListedValues = (values, draft, { matchOnLabel }) => {
    const test = getEntryTest(draft, matchOnLabel)
    const findText = getFindText(draft)
    const listed = []
    let hidden = 0

    for (const entry of values) {
        if (entry.key === SENTINEL_NO_VALUE) {
            if (!findText) {
                listed.push(entry)
            }
        } else if (test && !test(entry)) {
            hidden++
        } else if (normalizeText(entry.label).includes(findText)) {
            listed.push(entry)
        }
    }

    const counted = new Set(values.map(({ key }) => key))
    const gone = (draft.excluded ?? [])
        .filter((key) => !counted.has(key))
        .map((key) => ({ key, label: key, count: 0, isGone: true }))

    return { listed: [...listed, ...gone], hidden }
}

// The rows the draft would keep, among those the other filters keep
export const countKeptRows = (values, draft, { matchOnLabel }) => {
    const test = getEntryTest(draft, matchOnLabel)
    const excluded = new Set(draft.excluded)
    return values.reduce((sum, entry) => {
        const isKept =
            !excluded.has(entry.key) &&
            (entry.key === SENTINEL_NO_VALUE || !test || test(entry))
        return isKept ? sum + entry.count : sum
    }, 0)
}

// The filter Apply stores: no "Find in list" text, and a condition on names
// stored as the values it leaves out, so the map needs no names
export const toAppliedFilter = (draft, { matchOnLabel, allValues }) => {
    const { type, operator, value, value2, excluded = [] } = draft
    if (!hasCondition(draft)) {
        return { type, excluded }
    }
    const filter = { type, operator, value, value2, excluded }
    if (!matchOnLabel) {
        return filter
    }
    const test = getEntryTest(draft, true)
    return {
        ...filter,
        excludedByCondition: allValues
            .filter((entry) => entry.key !== SENTINEL_NO_VALUE && !test(entry))
            .map(({ key }) => key),
    }
}
