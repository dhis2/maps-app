import {
    SENTINEL_NO_VALUE,
    SORT_ASCENDING,
    TYPE_NUMBER,
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
} from '../constants/dataTable.js'
import {
    hasLegendRange,
    isRegularLegendItem,
    parseRange,
    sortLegendItems,
} from './legend.js'
import {
    formatOrgUnitOwnName,
    formatOrgUnitPathBreadcrumb,
} from './orgUnitGroups.js'

const RANGE = 'range'
const LEGEND_DATA_KEYS = new Set(['legend', RANGE, 'group'])
const LEGEND_RENDERERS = new Set([RENDERER_COLOR, RENDERER_ICON])

// Columns that show a row's legend class or what puts it there, sorted in the legend's order
export const isLegendColumn = ({ dataKey, renderer } = {}) =>
    LEGEND_DATA_KEYS.has(dataKey) || LEGEND_RENDERERS.has(renderer)

const applyDirection = (diff, sortDirection) =>
    sortDirection === SORT_ASCENDING ? diff : -diff

// A row's place among the given classes: by its class name,
// or by its color for automatic classes, which have no name
const rankRows = (orderedItems) => {
    const byName = new Map()
    const byColor = new Map()
    orderedItems.forEach((item, index) => {
        if (item.name && !byName.has(item.name)) {
            byName.set(item.name, index)
        }
        if (item.color && !byColor.has(item.color)) {
            byColor.set(item.color, index)
        }
    })
    return (row) => byName.get(row.legend) ?? byColor.get(row.color)
}

// From the lowest class to the highest: "No data", "Unclassified" and the isolated class first,
// as for empty cells, then classes with a range from the lowest, then the others as the layer card lists them
const getAscendingClasses = (legendItems) => {
    const cardItems = sortLegendItems(legendItems)
    const regularItems = cardItems.filter(isRegularLegendItem)
    return [
        ...cardItems.filter((item) => !isRegularLegendItem(item)).reverse(),
        ...regularItems.filter(hasLegendRange).reverse(),
        ...regularItems.filter((item) => !hasLegendRange(item)),
    ]
}

// A row's place when sorting by a legend column
export const getLegendRank = (legendItems) =>
    rankRows(getAscendingClasses(legendItems ?? []))

// A row's place in the layer card's list
export const getLegendCardRank = (legendItems) =>
    rankRows(sortLegendItems(legendItems ?? []))

// Rows outside the legend count as the lowest, as empty cells do
export const compareLegendRanks = (aRank, bRank, sortDirection) =>
    applyDirection((aRank ?? -1) - (bRank ?? -1), sortDirection)

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

const isNoValue = (val) => val === undefined || val === null || val === ''

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
    // Empty cells count as the lowest value: first when ascending, last when descending
    const aIsEmpty = isNoValue(aVal)
    const bIsEmpty = isNoValue(bVal)
    if (aIsEmpty || bIsEmpty) {
        return applyDirection(
            Number(bIsEmpty) - Number(aIsEmpty),
            sortDirection
        )
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
