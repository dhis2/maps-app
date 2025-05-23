// Valid value types:
// https://docs.dhis2.org/master/en/user/html/manage_data_element.html
// https://play.dhis2.org/demo/api/schemas/dataElement

// Number values types used for style by data item
export const numberValueTypes = [
    'INTEGER',
    'INTEGER_NEGATIVE',
    'INTEGER_POSITIVE',
    'INTEGER_ZERO_OR_POSITIVE',
    'NUMBER',
    'PERCENTAGE',
    'UNIT_INTERVAL',
]

// Text value types
export const textValueTypes = [
    'EMAIL',
    'LETTER',
    'LONG_TEXT',
    'PHONE_NUMBER',
    'TEXT',
    'USERNAME',
]

// Boolean value types
export const booleanValueTypes = ['BOOLEAN', 'TRUE_ONLY']

// Date value types
export const dateValueTypes = ['DATE', 'AGE']

// Date-time value types
export const datetimeValueTypes = ['DATETIME']

// Coordinate value types
export const coordinateValueTypes = ['COORDINATE']
