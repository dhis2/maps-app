import { bbox } from '@turf/bbox'
import { SORT_ASCENDING, SORT_DESCENDING } from '../constants/dataTable.js'
import {
    DATA_TABLE_LAYER_TYPES,
    EARTH_ENGINE_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    FACILITY_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
} from '../constants/layers.js'
import {
    getDefaultCombinedAggregationType,
    getDefaultCombinedAggregationTypeFromEarthEngineStat,
} from './aggregation.js'
import { getDataItemFromColumns, getOrgUnitsFromRows } from './analytics.js'
import { getJoinableFeatures } from './combinedJoinMatch.js'

export const COMBINED_VALUE_KEY = 'rawValue'

const CLASSIFIED_EARTH_ENGINE_AGGREGATION_TYPES = new Set([
    'percentage',
    'hectares',
    'acres',
])

const CLASSIFIED_EARTH_ENGINE_DEFAULT_AGGREGATION_TYPE = {
    percentage: 'AVERAGE',
    hectares: 'SUM',
    acres: 'SUM',
}

const toTitleCase = (str) =>
    str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )

export const getDefaultCombinedAggregation = (layer) => {
    let type
    if (Array.isArray(layer.aggregationType)) {
        type = getDefaultCombinedAggregationTypeFromEarthEngineStat(
            layer.aggregationType[0]
        )
    } else if (
        CLASSIFIED_EARTH_ENGINE_AGGREGATION_TYPES.has(layer.aggregationType)
    ) {
        type =
            CLASSIFIED_EARTH_ENGINE_DEFAULT_AGGREGATION_TYPE[
                layer.aggregationType
            ]
    } else {
        const dataItem = getDataItemFromColumns(layer.columns)
        type = getDefaultCombinedAggregationType(
            dataItem?.aggregationType,
            dataItem?.dimensionItemType
        )
    }
    return Object.fromEntries(
        getCombinedValueDataKeys(layer).map(({ dataKey }) => [dataKey, type])
    )
}

const getEarthEngineBandValueDataKeys = (layer) => {
    if (
        !layer.bands?.multiple ||
        !Array.isArray(layer.band) ||
        layer.band.length < 2
    ) {
        return []
    }
    const selectedBands =
        layer.bands.list?.filter((b) => layer.band.includes(b.id)) ?? []
    return selectedBands.flatMap(({ id: bandId, name: bandName }) =>
        layer.aggregationType.length === 1
            ? [{ dataKey: bandId, name: bandName, defaultHidden: true }]
            : layer.aggregationType.map((type) => ({
                  dataKey: `${bandId}_${type}`,
                  name: toTitleCase(`${type} ${bandName}`),
                  defaultHidden: true,
              }))
    )
}

export const getCombinedValueDataKeys = (layer) => {
    if (layer.layer !== EARTH_ENGINE_LAYER) {
        return [{ dataKey: COMBINED_VALUE_KEY, name: null }]
    }
    if (
        CLASSIFIED_EARTH_ENGINE_AGGREGATION_TYPES.has(layer.aggregationType) &&
        layer.legend?.items
    ) {
        return layer.legend.items.map(({ value, name }) => ({
            dataKey: String(value),
            name,
        }))
    }
    if (Array.isArray(layer.aggregationType) && layer.aggregationType.length) {
        return layer.aggregationType
            .map((type) => ({
                dataKey: type,
                name: toTitleCase(
                    `${type} ${layer.legend?.title ?? ''}`.trim()
                ),
            }))
            .concat(getEarthEngineBandValueDataKeys(layer))
    }
    return []
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
        return candidates.reduce((best, candidate) =>
            isBetterReferenceCandidate(candidate, best) ? candidate : best
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

export const isDataTableOpen = ({ openIds, combinedView }) =>
    openIds.length > 0 || combinedView

export const getEligibleDataTableLayers = (mapViews) =>
    mapViews.filter(
        (l) => DATA_TABLE_LAYER_TYPES.includes(l.layer) && l.isLoaded
    )

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
