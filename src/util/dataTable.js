import {
    SORT_ASCENDING,
    SORT_DESCENDING,
    TYPE_NUMBER,
    TYPE_DATE,
    TYPE_DATETIME,
    FILTER_TEXT,
    FILTER_NUMBER,
    FILTER_DATE,
} from '../constants/dataTable.js'

export const isFilterable = (dataKey, type) => !!type

// The column's own filter kind, else one that fits its values
export const getFilterType = ({ type, filterType }) => {
    if (filterType) {
        return filterType
    }
    if (type === TYPE_NUMBER) {
        return FILTER_NUMBER
    }
    if (type === TYPE_DATE || type === TYPE_DATETIME) {
        return FILTER_DATE
    }
    return FILTER_TEXT
}

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
