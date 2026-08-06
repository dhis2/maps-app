import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    DATE_GROUPS_GRANULARITY,
    ORG_UNIT_GROUPS_GRANULARITY,
    TYPE_NUMBER,
} from '../constants/dataTable.js'
import { formatCellText } from './cellValue.js'

// Distinguishes a prefix-group filter (date-groups, org-unit-groups, ...)
export const isPrefixGroupFilter = (filter, granularity) =>
    filter != null &&
    typeof filter === 'object' &&
    !Array.isArray(filter) &&
    filter.granularity === granularity

export const prefixGroupFilter = (value, { prefixes, searchDerived }) => {
    if (!prefixes?.length) {
        return !searchDerived
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

            if (isDateGroupFilter(filter) || isOrgUnitGroupFilter(filter)) {
                return prefixGroupFilter(value, filter)
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

const getSearchableTexts = (value, header, formatArgs) => {
    if (value == null) {
        return []
    }
    const formatted = formatCellText(value, {
        renderer: header.renderer,
        type: header.type,
        ...formatArgs,
    })
    return header.type === TYPE_NUMBER
        ? [String(value), formatted]
        : [formatted]
}

export const filterByGlobalSearch = (
    data,
    searchString,
    { headers = [], orgUnitIdToName, keyAnalysisDigitGroupSeparator } = {}
) => {
    if (!searchString?.trim() || !headers.length) {
        return data
    }
    const lower = searchString.toLowerCase()
    return data.filter((item) => {
        const props = item.properties || item
        return headers.some((header) =>
            getSearchableTexts(props[header.dataKey], header, {
                orgUnitIdToName,
                keyAnalysisDigitGroupSeparator,
            }).some((text) => text.toLowerCase().includes(lower))
        )
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
