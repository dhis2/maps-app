import {
    SENTINEL_NO_VALUE,
    SORT_ASCENDING,
    TYPE_NUMBER,
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
} from '../constants/dataTable.js'
import { parseRange, sortLegendItems } from './legend.js'
import {
    formatOrgUnitOwnName,
    formatOrgUnitPathBreadcrumb,
} from './orgUnitGroups.js'

const LEGEND = 'legend'
const RANGE = 'range'
const LEGEND_RENDERERS = new Set([RENDERER_COLOR, RENDERER_ICON])

// Columns that show a row's legend class or group, sorted in the legend's order
export const isLegendColumn = ({ dataKey, renderer } = {}) =>
    dataKey === LEGEND || dataKey === RANGE || LEGEND_RENDERERS.has(renderer)

// A row's place in the legend, as the layer card lists it: by its class or group name,
// or by its color for automatic classes, which have no name. "No data" ranks after every class
export const getLegendRank = (legendItems) => {
    const byName = new Map()
    const byColor = new Map()
    sortLegendItems(legendItems ?? []).forEach((item, index) => {
        const rank = item.isNoData ? Infinity : index
        if (item.name && !byName.has(item.name)) {
            byName.set(item.name, rank)
        }
        if (item.color && !byColor.has(item.color)) {
            byColor.set(item.color, rank)
        }
    })
    return (row) =>
        byName.get(row.legend ?? row.group) ?? byColor.get(row.color)
}

// The legend's order, reversed when descending; "No data" and rows outside the legend stay last
export const compareLegendRanks = (aRank, bRank, sortDirection) => {
    if (aRank === bRank) {
        return 0
    }
    if (aRank === undefined || aRank === Infinity) {
        return 1
    }
    if (bRank === undefined || bRank === Infinity) {
        return -1
    }
    return sortDirection === SORT_ASCENDING ? aRank - bRank : bRank - aRank
}

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
        type === TYPE_NUMBER ? Number(a) - Number(b) : compareStrings(a, b)
    return direction === SORT_ASCENDING ? comparison : -comparison
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

const isNoValue = (val) => val === undefined || val === null

const resolveSortText = (value, renderer, idToName) => {
    if (renderer === RENDERER_ORG_UNIT) {
        return formatOrgUnitPathBreadcrumb(value, idToName)
    }
    if (renderer === RENDERER_ORG_UNIT_NAME) {
        return formatOrgUnitOwnName(value, idToName)
    }
    return value
}

export const compareFieldValues = (
    aVal,
    bVal,
    { sortField, sortDirection, orgUnitRenderer, idToName }
) => {
    // All missing values should be sorted to the end
    if (isNoValue(aVal) && isNoValue(bVal)) {
        return 0
    }
    if (isNoValue(aVal)) {
        return 1
    }
    if (isNoValue(bVal)) {
        return -1
    }
    if (typeof aVal === 'number') {
        return sortDirection === SORT_ASCENDING ? aVal - bVal : bVal - aVal
    }
    if (sortField === RANGE) {
        return compareRangeValues(aVal, bVal, sortDirection)
    }
    const aText = resolveSortText(aVal, orgUnitRenderer, idToName)
    const bText = resolveSortText(bVal, orgUnitRenderer, idToName)
    // TODO: Make sure sorting works across different locales
    return sortDirection === SORT_ASCENDING
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText)
}

export const compareRows = (a, b, options) => {
    const { sortField, sortDirection, getRank } = options
    // "None" (third click of the cycle) - fall back to natural order
    if (!sortField) {
        return a.index - b.index
    }
    if (getRank) {
        return compareLegendRanks(getRank(a), getRank(b), sortDirection)
    }
    return compareFieldValues(a[sortField], b[sortField], options)
}
