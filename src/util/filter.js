import isNumeric from 'd2-utilizr/lib/isNumeric';
import isString from 'd2-utilizr/lib/isString';

// Filters an array of object with a set of filters
export const filterData = (data, filters) => {
    if (!filters) {
        return data;
    }

    const fieldIds = Object.keys(filters);
    let filteredData = [...data];

    Object.keys(filters).forEach(field => { // Loop through all filters
        const filter = filters[field];

        filteredData = filteredData.filter(d => { // Loop through all data items
            const props = d.properties || d; // GeoJSON or plain object
            const value = props[field];
            return isNumeric(value) ? numericFilter(value, filter) : stringFilter(value, filter);
        });
    });

    return filteredData;
};

// Simple check if string contains another string
export const stringFilter = (string, filter) => {
    return ('' + string).toLowerCase().indexOf(filter.toLowerCase()) !== -1;
};

// Numeric filter supporting AND, OR, GREATER THAN, LESS THAN or equal number
export const numericFilter = (value, filter) => {
    // TODO: Syntax error handling
    return filter.split(',').some(orFilter => { // OR filter
        return orFilter.split('&').every(filter => isTrueFilter(value, filter)); // AND filter
    });
};

// Returns true if the filter is true
const isTrueFilter = (value, filter) => {
    if (filter.indexOf('>') > -1) { // GREATER THAN
        return value >= Number(filter.split('>')[1]);
    }

    if (filter.indexOf('<') > -1) { // LESS THAN
        return value <= Number(filter.split('<')[1]);
    }

    return (value === Number(filter)); // Equal number
};

