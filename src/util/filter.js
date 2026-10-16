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

            if (typeof filter === 'object') {
                return structuredFilter(value, filter)
            }

            return typeof value === 'number'
                ? numericFilter(value, filter)
                : stringFilter(value, filter)
        })
    })

    return filteredData
}

// Structured filters set from the data table column popovers
// { type: 'text', value }
// { type: 'number', operator, value, value2 }
// { type: 'options', values: [] }
// { type: 'date', from, to } (YYYY-MM-DD, both optional)
export const structuredFilter = (value, filter) => {
    switch (filter.type) {
        case 'text':
            return stringFilter(value ?? '', filter.value)
        case 'number': {
            const num = Number(value)
            if (value === null || value === undefined || isNaN(num)) {
                return false
            }
            const a = Number(filter.value)
            const b = Number(filter.value2)
            switch (filter.operator) {
                case 'eq':
                    return num === a
                case 'neq':
                    return num !== a
                case 'gt':
                    return num > a
                case 'gte':
                    return num >= a
                case 'lt':
                    return num < a
                case 'lte':
                    return num <= a
                case 'between':
                    return num >= Math.min(a, b) && num <= Math.max(a, b)
                default:
                    return true
            }
        }
        case 'options':
            return filter.values.includes(toOptionValue(value))
        case 'date': {
            if (!value) {
                return false
            }
            const date = String(value).slice(0, 10)
            return (
                (!filter.from || date >= filter.from) &&
                (!filter.to || date <= filter.to)
            )
        }
        default:
            return true
    }
}

// Option values are compared as strings, empty values as ''
export const toOptionValue = (value) =>
    value === null || value === undefined ? '' : String(value)

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
