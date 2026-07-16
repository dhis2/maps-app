import {
    SENTINEL_NO_VALUE,
    SENTINEL_SELECTED_ROW,
    SORT_ASCENDING,
} from '../constants/dataTable.js'
import { parseRange } from './legend.js'

const RANGE = 'range'

const compareStrings = (a, b) => {
    if (a < b) {
        return -1
    }
    if (a > b) {
        return 1
    }
    return 0
}

export const compareColumnOptionValues = (
    a,
    b,
    { dataKey, type, direction = SORT_ASCENDING }
) => {
    if (a === SENTINEL_NO_VALUE) {
        return -1
    }
    if (b === SENTINEL_NO_VALUE) {
        return 1
    }
    if (dataKey === RANGE) {
        return compareRangeValues(a, b, direction)
    }
    const comparison =
        type === 'number' ? Number(a) - Number(b) : compareStrings(a, b)
    return direction === SORT_ASCENDING ? comparison : -comparison
}

// Ascending (the default on first click) puts selected rows first
export const compareBySelected = (a, b, { selectedIdSet, sortDirection }) => {
    const aSelected = selectedIdSet?.has(a.id) ? 1 : 0
    const bSelected = selectedIdSet?.has(b.id) ? 1 : 0
    return sortDirection === SORT_ASCENDING
        ? bSelected - aSelected
        : aSelected - bSelected
}

export const compareRangeValues = (aVal, bVal, sortDirection) => {
    const [aStart, aEnd] = parseRange(aVal)
    const [bStart, bEnd] = parseRange(bVal)
    const startDiff =
        sortDirection === SORT_ASCENDING ? aStart - bStart : bStart - aStart
    if (startDiff !== 0) {
        return startDiff
    }
    return sortDirection === SORT_ASCENDING ? aEnd - bEnd : bEnd - aEnd
}

export const compareFieldValues = (
    aVal,
    bVal,
    { sortField, sortDirection }
) => {
    // All undefined values should be sorted to the end
    if (aVal === undefined && bVal === undefined) {
        return 0
    }
    if (aVal === undefined) {
        return 1
    }
    if (bVal === undefined) {
        return -1
    }
    if (typeof aVal === 'number') {
        return sortDirection === SORT_ASCENDING ? aVal - bVal : bVal - aVal
    }
    if (sortField === RANGE) {
        return compareRangeValues(aVal, bVal, sortDirection)
    }
    // TODO: Make sure sorting works across different locales
    return sortDirection === SORT_ASCENDING
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
}

export const compareRows = (a, b, options) => {
    const { sortField } = options
    // "None" (third click of the cycle) - fall back to natural order
    if (!sortField) {
        return a.index - b.index
    }
    if (sortField === SENTINEL_SELECTED_ROW) {
        return compareBySelected(a, b, options)
    }
    return compareFieldValues(a[sortField], b[sortField], options)
}
