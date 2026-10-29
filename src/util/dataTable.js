import { SORT_ASCENDING, SORT_DESCENDING } from '../constants/dataTable.js'
import { DATA_TABLE_LAYER_TYPES } from '../constants/layers.js'

export const isFilterable = (dataKey, type) => !!type

export const shouldClearFeatureHighlight = (event) =>
    event.relatedTarget?.tagName !== 'TD'

export const getNextSorting = (
    name,
    { sortField, sortDirection },
    { defaultSortField = 'name', defaultSortDirection = SORT_ASCENDING } = {}
) => {
    if (name !== sortField) {
        return { sortField: name, sortDirection: SORT_ASCENDING }
    }
    if (sortDirection === SORT_ASCENDING) {
        return { sortField: name, sortDirection: SORT_DESCENDING }
    }
    return { sortField: defaultSortField, sortDirection: defaultSortDirection }
}

export const getRowId = (row) =>
    row.find((r) => r.dataKey === 'id')?.value || row[0]?.itemId

export const getRowClickAction = (
    event,
    { id, rowIndex, rows, lastClickedRowIndex }
) => {
    if (event.shiftKey) {
        if (lastClickedRowIndex === null) {
            return { type: 'range', ids: [id] }
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

export const hasActiveDataTableFilters = ({
    dataFilters,
    globalSearch,
    selectionFilter,
    showOnlyFeaturesInView,
}) =>
    Object.keys(dataFilters ?? {}).length > 0 ||
    !!globalSearch?.trim() ||
    selectionFilter?.length > 0 ||
    !!showOnlyFeaturesInView

export const isDataTableOpen = ({ openIds, isPanelVisible }) =>
    isPanelVisible && openIds.length > 0

export const getEligibleDataTableLayers = (mapViews) =>
    mapViews.filter(
        (l) => DATA_TABLE_LAYER_TYPES.includes(l.layer) && l.isLoaded
    )

export const getLayerSelectedIds = (selection, layerId) =>
    selection?.layerId === layerId ? selection.ids ?? [] : []

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
