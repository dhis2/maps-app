import { SENTINEL_ANY_VALUE } from '../constants/dataTable.js'

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

            if (Array.isArray(filter)) {
                // Multi-select: OR match against the raw stored value
                const stringValue = value == null ? '' : String(value)
                return (
                    filter.length === 0 ||
                    filter.includes(stringValue) ||
                    (stringValue !== '' && filter.includes(SENTINEL_ANY_VALUE))
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

// Case-insensitive match against any of the given string fields
export const filterByGlobalSearch = (data, searchString, stringDataKeys) => {
    if (!searchString?.trim() || !stringDataKeys?.length) {
        return data
    }
    const lower = searchString.toLowerCase()
    return data.filter((item) => {
        const props = item.properties || item
        return stringDataKeys.some((key) => {
            const val = props[key]
            return val != null && String(val).toLowerCase().includes(lower)
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
