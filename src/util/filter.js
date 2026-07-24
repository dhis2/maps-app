import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    DATE_GROUPS_GRANULARITY,
    ORG_UNIT_GROUPS_GRANULARITY,
} from '../constants/dataTable.js'
import { formatOrgUnitPathBreadcrumb } from './orgUnitGroups.js'

// Distinguishes a prefix-group filter (date-groups, org-unit-groups, ...)
export const isPrefixGroupFilter = (filter, granularity) =>
    filter != null &&
    typeof filter === 'object' &&
    !Array.isArray(filter) &&
    filter.granularity === granularity

export const prefixGroupFilter = (value, { prefixes }) => {
    if (!prefixes?.length) {
        return true
    }
    const stringValue = value == null ? SENTINEL_NO_VALUE : String(value)
    return prefixes.some((prefix) => {
        if (prefix === SENTINEL_NO_VALUE) {
            return stringValue === SENTINEL_NO_VALUE
        }
        if (prefix === SENTINEL_ANY_VALUE) {
            return stringValue !== SENTINEL_NO_VALUE
        }
        return stringValue.startsWith(prefix)
    })
}

export const isDateGroupFilter = (filter) =>
    isPrefixGroupFilter(filter, DATE_GROUPS_GRANULARITY)
export const isOrgUnitGroupFilter = (filter) =>
    isPrefixGroupFilter(filter, ORG_UNIT_GROUPS_GRANULARITY)

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

            if (isDateGroupFilter(filter) || isOrgUnitGroupFilter(filter)) {
                return prefixGroupFilter(value, filter)
            }

            if (Array.isArray(filter)) {
                // Multi-select: OR match against the raw stored value
                const stringValue =
                    value == null ? SENTINEL_NO_VALUE : String(value)
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

export const filterByGlobalSearch = (
    data,
    searchString,
    { stringDataKeys = [], orgUnitDataKeys = [], idToName } = {}
) => {
    if (
        !searchString?.trim() ||
        (!stringDataKeys.length && !orgUnitDataKeys.length)
    ) {
        return data
    }
    const lower = searchString.toLowerCase()
    return data.filter((item) => {
        const props = item.properties || item
        const stringMatch = stringDataKeys.some((key) => {
            const val = props[key]
            return val != null && String(val).toLowerCase().includes(lower)
        })
        if (stringMatch) {
            return true
        }
        return orgUnitDataKeys.some((key) => {
            const val = props[key]
            return (
                val != null &&
                formatOrgUnitPathBreadcrumb(val, idToName)
                    .toLowerCase()
                    .includes(lower)
            )
        })
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
