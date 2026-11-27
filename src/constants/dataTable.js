export const SENTINEL_NO_VALUE = '' // Matches filterData's existing null/undefined -> empty-string coercion (src/util/filter.js)
export const SENTINEL_ANY_VALUE = '__any_value__'

export const SORT_ASCENDING = 'asc'
export const SORT_DESCENDING = 'desc'

export const RENDERER_COLOR = 'rendercolor'
export const RENDERER_ICON = 'rendericon'
export const RENDERER_DATE = 'renderdate'
export const RENDERER_ORG_UNIT = 'renderorgunit'
export const RENDERER_ORG_UNIT_NAME = 'renderorgunitname'
export const RENDERER_BOOLEAN = 'renderboolean'
export const RENDERER_GEOMETRY = 'rendergeometry'
export const RENDERER_EVENT_STATUS = 'rendereventstatus'

export const TYPE_NUMBER = 'number'
export const TYPE_STRING = 'string'
export const TYPE_DATE = 'date'
export const TYPE_DATETIME = 'datetime'
export const TYPE_TIME = 'time'
export const TYPE_ORG_UNIT = 'orgUnit'

export const ORG_UNIT_PATH_DATA_KEY = 'orgUnitPath'
export const ORG_UNIT_DATA_KEY = 'orgUnitOwn'
export const ORG_UNIT_ID_DATA_KEY = 'orgUnitId'
export const ORG_UNIT_LEVEL_DATA_KEY = 'level'

// Kinds of column filter condition, by the column's values
export const FILTER_TEXT = 'text'
export const FILTER_NUMBER = 'number'
export const FILTER_DATE = 'date'
export const FILTER_TIME = 'time'

// A column whose filter shows only the list of values, without a condition
export const FILTER_VIEW_VALUES_ONLY = 'valuesOnly'

export const OPERATOR_CONTAINS = 'contains'
export const OPERATOR_NOT_CONTAINS = 'notContains'
export const OPERATOR_IS = 'is'
export const OPERATOR_STARTS_WITH = 'startsWith'
export const OPERATOR_EQUAL = 'eq'
export const OPERATOR_NOT_EQUAL = 'neq'
export const OPERATOR_GREATER = 'gt'
export const OPERATOR_GREATER_OR_EQUAL = 'gte'
export const OPERATOR_LESS = 'lt'
export const OPERATOR_LESS_OR_EQUAL = 'lte'
export const OPERATOR_BETWEEN = 'between'
export const OPERATOR_ON = 'on'
export const OPERATOR_BEFORE = 'before'
export const OPERATOR_AFTER = 'after'
// "Find in list": the text only searches the list of values, it is never saved
export const OPERATOR_FIND = 'find'
