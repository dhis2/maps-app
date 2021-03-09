import isNumeric from 'd2-utilizr/lib/isNumeric';

// Filters an array of object with a set of filters
export const filterData = (filters, data, aggregations = {}) => {
    if (!filters) {
        return data;
    }

    let filteredData = [...data];

    Object.keys(filters).forEach(field => {
        // Loop through all filters
        const filter = filters[field];

        filteredData = filteredData.filter(d => {
            // Loop through all data items
            const props = d.properties || d; // GeoJSON or plain object
            let value = props[field];

            // Look for value in aggregations if not in properties
            if (value === undefined && aggregations[d.id]) {
                value = aggregations[d.id][field];
            }

            if (value === undefined) {
                return false;
            }

            return isNumeric(value)
                ? numericFilter(value, filter)
                : stringFilter(value, filter);
        });
    });

    return filteredData;
};

// Simple check if string contains another string
export const stringFilter = (string, filter) => {
    return ('' + string).toLowerCase().includes(filter.toLowerCase());
};

// Numeric filter supporting AND, OR, GREATER THAN, LESS THAN or equal number
export const numericFilter = (value, filter) => {
    // TODO: Syntax error handling
    return filter.split(',').some(orFilter => {
        // OR filter
        return orFilter.split('&').every(filter => isTrueFilter(value, filter)); // AND filter
    });
};

// Returns true if the filter is true
const isTrueFilter = (value, filter) => {
    if (filter.includes('>')) {
        // GREATER THAN
        return value >= Number(filter.split('>')[1]);
    }

    if (filter.includes('<')) {
        // LESS THAN
        return value <= Number(filter.split('<')[1]);
    }

    return value === Number(filter); // Equal number
};
