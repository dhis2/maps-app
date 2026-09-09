import { SORT_ASCENDING, SORT_DESCENDING } from '../constants/dataTable.js'
import {
    DATA_TABLE_LAYER_TYPES,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../constants/layers.js'
import { getOrgUnitsFromRows } from './analytics.js'
import { getJoinableFeatures } from './combinedJoinMatch.js'

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

const REFERENCE_ROWS_LEVEL_COMPARABLE_TYPES = [
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    FACILITY_LAYER,
]

const REFERENCE_ROWS_FALLBACK_TYPES = [EVENT_LAYER, TRACKED_ENTITY_LAYER]

const getMinFeatureLevel = (mapView) => {
    const levels = getJoinableFeatures(mapView)
        .map((f) => (f.properties ?? f).level)
        .filter((level) => typeof level === 'number')
    return levels.length ? Math.min(...levels) : null
}

const isBetterReferenceCandidate = (a, b) => {
    if (a.level !== null && b.level !== null && a.level !== b.level) {
        return a.level < b.level
    }
    if (a.priority !== b.priority) {
        return a.priority < b.priority
    }
    return a.index < b.index
}

export const getDefaultReferenceRows = (mapViews = []) => {
    const candidates = mapViews
        .map((mapView, index) => ({ mapView, index }))
        .filter(
            ({ mapView }) =>
                REFERENCE_ROWS_LEVEL_COMPARABLE_TYPES.includes(mapView.layer) &&
                getOrgUnitsFromRows(mapView.rows).length
        )
        .map(({ mapView, index }) => ({
            mapView,
            index,
            priority: REFERENCE_ROWS_LEVEL_COMPARABLE_TYPES.indexOf(
                mapView.layer
            ),
            level: getMinFeatureLevel(mapView),
        }))

    if (candidates.length) {
        return candidates.reduce(
            (best, candidate) =>
                isBetterReferenceCandidate(candidate, best) ? candidate : best,
            candidates[0]
        ).mapView.rows
    }

    for (const layerType of REFERENCE_ROWS_FALLBACK_TYPES) {
        const layer = mapViews.find(
            (mv) =>
                mv.layer === layerType && getOrgUnitsFromRows(mv.rows).length
        )
        if (layer) {
            return layer.rows
        }
    }
    return []
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
