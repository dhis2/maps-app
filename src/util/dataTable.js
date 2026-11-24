import {
    SORT_ASCENDING,
    SORT_DESCENDING,
    TYPE_NUMBER,
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_TIME,
    FILTER_TEXT,
    FILTER_NUMBER,
    FILTER_DATE,
    FILTER_TIME,
    RENDERER_BOOLEAN,
    RENDERER_COLOR,
    RENDERER_ICON,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    ORG_UNIT_ID_DATA_KEY,
} from '../constants/dataTable.js'

export const isFilterable = (dataKey, type) => !!type

const FILTER_TYPE_BY_COLUMN_TYPE = {
    [TYPE_NUMBER]: FILTER_NUMBER,
    [TYPE_DATE]: FILTER_DATE,
    [TYPE_DATETIME]: FILTER_DATE,
    [TYPE_TIME]: FILTER_TIME,
}

const NAMED_VALUE_RENDERERS = new Set([
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    RENDERER_ICON,
])

// Columns whose cells show a name for the stored value: org units, option sets, Yes/no, icons
export const isNamedValueColumn = ({ renderer, optionSet }) =>
    NAMED_VALUE_RENDERERS.has(renderer) || !!optionSet

// Ids and color codes, shown in a monospace font in cells and value lists
export const isMonospaceColumn = ({ dataKey, renderer }) =>
    dataKey === 'id' ||
    dataKey === ORG_UNIT_ID_DATA_KEY ||
    renderer === RENDERER_COLOR

// The kind of condition that fits a column's values; text for the others, org units included
export const getFilterType = ({ type }) =>
    FILTER_TYPE_BY_COLUMN_TYPE[type] ?? FILTER_TEXT

export const shouldClearFeatureHighlight = (event) =>
    event.relatedTarget?.tagName !== 'TD'

export const getNextSorting = (name, { sortField, sortDirection }) => {
    if (name !== sortField) {
        return { sortField: name, sortDirection: SORT_ASCENDING }
    }
    if (sortDirection === SORT_ASCENDING) {
        return { sortField: name, sortDirection: SORT_DESCENDING }
    }
    return { sortField: null, sortDirection: SORT_ASCENDING }
}

export const getRowId = (row) =>
    row.find((r) => r.dataKey === 'id')?.value || row[0]?.itemId

export const getRowClickAction = (
    event,
    { id, rowIndex, rows, lastClickedRowIndex }
) => {
    if (event.shiftKey) {
        if (lastClickedRowIndex === null) {
            return { type: 'toggle', id }
        }
        const [start, end] = [lastClickedRowIndex, rowIndex].sort(
            (a, b) => a - b
        )
        const ids = rows
            .slice(start, end + 1)
            .map(getRowId)
            .filter(Boolean)
        return { type: 'range', ids }
    }

    if (event.ctrlKey || event.metaKey) {
        return { type: 'toggle', id }
    }

    return null
}

export const hasActiveDataTableFilters = ({ dataFilters }) =>
    Object.keys(dataFilters ?? {}).length > 0

export const buildFeatureIndex = (data) => {
    const index = new Map()
    data?.forEach((f) => {
        const id = f.properties?.id ?? f.id
        if (id != null) {
            index.set(id, f)
        }
    })
    return index
}

export const getPanelHeights = ({
    windowHeight,
    dataTableHeight,
    isCollapsed,
    headerHeight,
    toolbarHeight,
    controlsHeight,
}) => {
    const maxHeight = windowHeight - headerHeight - toolbarHeight
    const tableHeight = Math.min(dataTableHeight, maxHeight)
    return {
        maxHeight,
        collapsedHeight: controlsHeight,
        displayHeight: isCollapsed ? controlsHeight : tableHeight,
    }
}
