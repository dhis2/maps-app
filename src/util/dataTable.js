import { bbox } from '@turf/bbox'
import { SORT_ASCENDING, SORT_DESCENDING } from '../constants/dataTable.js'

export const isFilterable = (dataKey, type) => !!type

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

// state.dataTable.combinedView can legitimately stay true with openIds
// empty (e.g. every single-layer tab was closed while Combined stayed
// open) - the panel must stay open in that case too, not just when a
// single-layer tab is open.
export const isDataTableOpen = ({ openIds, combinedView }) =>
    openIds.length > 0 || combinedView

// A crossLayerIds selection has no single owning layerId (layerId: null),
// so a layer's own selection can't be read off selection.ids alone once
// Combined-originated selections exist - merges in whatever this layer is
// named under in crossLayerIds too.
export const getLayerSelectedIds = (selection, layerId) => {
    const ownIds = selection?.layerId === layerId ? selection.ids ?? [] : []
    const crossIds = selection?.crossLayerIds?.[layerId] ?? []
    return crossIds.length ? [...new Set([...ownIds, ...crossIds])] : ownIds
}

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

// Merges the per-layer feature id sets of several Combined rows (e.g. every
// selected row, or every currently filtered row) into one map suitable for
// a single crossLayerIds highlight/selection/zoom dispatch.
export const mergeCrossLayerIds = (rowKeys, rowFeatureIds) => {
    const merged = {}
    rowKeys.forEach((key) => {
        const entry = rowFeatureIds.get(key)
        if (!entry) {
            return
        }
        Object.entries(entry).forEach(([layerId, ids]) => {
            merged[layerId] = [...new Set([...(merged[layerId] ?? []), ...ids])]
        })
    })
    return merged
}

// Same bbox-of-matching-features computation Layer.js's own panToFeature
// does for a single layer, generalized across every layer named in
// crossLayerIds - used for Combined row/selection/filtered-set zoom, where
// no single Layer instance owns the feature set being zoomed to.
export const getUnionBounds = (layers, idsByLayerId) => {
    const features = layers.flatMap((layer) => {
        const ids = idsByLayerId[layer.id]
        if (!ids?.length) {
            return []
        }
        const index = buildFeatureIndex(layer.data)
        return ids.map((id) => index.get(id)).filter((f) => f?.geometry)
    })

    if (!features.length) {
        return null
    }

    const [minLng, minLat, maxLng, maxLat] = bbox({
        type: 'FeatureCollection',
        features,
    })

    return Number.isFinite(minLng)
        ? [
              [minLng, minLat],
              [maxLng, maxLat],
          ]
        : null
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
