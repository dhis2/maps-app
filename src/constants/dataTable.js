export const SENTINEL_NO_VALUE = '' // Matches filterData's existing null/undefined -> empty-string coercion (src/util/filter.js)
export const SENTINEL_ANY_VALUE = '__any_value__'
export const SENTINEL_SELECTED_ROW = '__selected__'
export const SENTINEL_COMBINED_VALUE = '__combined_value__'

export const SORT_ASCENDING = 'asc'
export const SORT_DESCENDING = 'desc'

export const RENDERER_COLOR = 'rendercolor'
export const RENDERER_ICON = 'rendericon'
export const RENDERER_DATE = 'renderdate'
export const RENDERER_ORG_UNIT = 'renderorgunit'
export const RENDERER_ORG_UNIT_NAME = 'renderorgunitname'
export const RENDERER_BOOLEAN = 'renderboolean'

export const TYPE_NUMBER = 'number'
export const TYPE_STRING = 'string'
export const TYPE_DATE = 'date'
export const TYPE_DATETIME = 'datetime'
export const TYPE_TIME = 'time'
export const TYPE_ORG_UNIT = 'orgUnit'

export const DATE_GROUPS_GRANULARITY = 'date-groups'
export const ORG_UNIT_GROUPS_GRANULARITY = 'org-unit-groups'

export const ORG_UNIT_PATH_DATA_KEY = 'orgUnitPath'
export const ORG_UNIT_DATA_KEY = 'orgUnitOwn'
export const ORG_UNIT_ID_DATA_KEY = 'orgUnitId'
export const ORG_UNIT_LEVEL_DATA_KEY = 'level'

export const COMBINED_HEADERS_KEY = '__combined__'

// Combined table value-column kinds - see getCombinedValueDataKeys()
// (util/dataTable.js): a layer's per-dataKey Value column is either a real
// numeric value (existing aggregation-type dropdown), a plain feature
// count (no classification to break down), or a per-category count/%
// breakdown (the layer is styled by a discrete classification).
export const DATA_KEY_KIND_VALUE = 'value'
export const DATA_KEY_KIND_COUNT = 'count'
export const DATA_KEY_KIND_CATEGORY = 'category'
