import { bbox } from '@turf/bbox'
import {
    DATA_KEY_KIND_CATEGORY,
    DATA_KEY_KIND_COUNT,
    DATA_KEY_KIND_VALUE,
    SORT_ASCENDING,
    SORT_DESCENDING,
} from '../constants/dataTable.js'
import {
    DATA_TABLE_LAYER_TYPES,
    EARTH_ENGINE_LAYER,
    THEMATIC_LAYER,
    ORG_UNIT_LAYER,
    FACILITY_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
} from '../constants/layers.js'
import { numberValueTypes } from '../constants/valueTypes.js'
import {
    getDefaultCombinedAggregationType,
    getDefaultCombinedAggregationTypeFromEarthEngineStat,
} from './aggregation.js'
import { getDataItemFromColumns, getOrgUnitsFromRows } from './analytics.js'
import { getJoinableFeatures } from './combinedJoinMatch.js'

export const COMBINED_VALUE_KEY = 'rawValue'
export const COMBINED_COUNT_KEY = 'count'
export const UNCLASSIFIED_CATEGORY_KEY = 'unclassified'
export const EVENT_STYLE_VALUE_KEY = 'value'
export const CATEGORY_DISPLAY_TYPE_KEY = 'categoryDisplayType'

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

const getValueAggregationType = (layer) => {
    if (Array.isArray(layer.aggregationType)) {
        return getDefaultCombinedAggregationTypeFromEarthEngineStat(
            layer.aggregationType[0]
        )
    }
    if (CLASSIFIED_EARTH_ENGINE_AGGREGATION_TYPES.has(layer.aggregationType)) {
        return CLASSIFIED_EARTH_ENGINE_DEFAULT_AGGREGATION_TYPE[
            layer.aggregationType
        ]
    }
    if (layer.layer === EVENT_LAYER) {
        return 'AVERAGE'
    }
    const dataItem = getDataItemFromColumns(layer.columns)
    return getDefaultCombinedAggregationType(
        dataItem?.aggregationType,
        dataItem?.dimensionItemType
    )
}

export const getDefaultCombinedAggregation = (layer) => {
    const valueType = getValueAggregationType(layer)
    const dataKeys = getCombinedValueDataKeys(layer)
    const entries = dataKeys
        .filter(({ kind }) => kind !== DATA_KEY_KIND_CATEGORY)
        .map(({ dataKey, kind }) => [
            dataKey,
            kind === DATA_KEY_KIND_VALUE ? valueType : 'COUNT',
        ])
    if (dataKeys.some(({ kind }) => kind === DATA_KEY_KIND_CATEGORY)) {
        entries.push([CATEGORY_DISPLAY_TYPE_KEY, 'COUNT'])
    }
    return Object.fromEntries(entries)
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
            ? [
                  {
                      dataKey: bandId,
                      name: bandName,
                      kind: DATA_KEY_KIND_VALUE,
                      defaultHidden: true,
                  },
              ]
            : layer.aggregationType.map((type) => ({
                  dataKey: `${bandId}_${type}`,
                  name: toTitleCase(`${type} ${bandName}`),
                  kind: DATA_KEY_KIND_VALUE,
                  defaultHidden: true,
              }))
    )
}

const isOrgUnitGroupSetCategorical = (layer) =>
    !!layer.organisationUnitGroupSet?.id &&
    (layer.legend?.items?.length ?? 0) > 1

const getOrgUnitGroupValueDataKeys = (layer) => {
    if (!isOrgUnitGroupSetCategorical(layer)) {
        return [
            {
                dataKey: COMBINED_COUNT_KEY,
                name: null,
                kind: DATA_KEY_KIND_COUNT,
            },
        ]
    }
    return layer.legend.items.map(({ id, name }) => ({
        dataKey: id ?? UNCLASSIFIED_CATEGORY_KEY,
        name,
        kind: DATA_KEY_KIND_CATEGORY,
    }))
}

const getEventValueDataKeys = (layer) => {
    if (
        layer.styleDataItem &&
        numberValueTypes.includes(layer.styleDataItem.valueType)
    ) {
        return [
            {
                dataKey: EVENT_STYLE_VALUE_KEY,
                name: layer.styleDataItem.name ?? null,
                kind: DATA_KEY_KIND_VALUE,
            },
        ]
    }
    if ((layer.legend?.items?.length ?? 0) > 1) {
        return layer.legend.items.map(({ colorGroup, name }) => ({
            dataKey: String(colorGroup),
            name,
            kind: DATA_KEY_KIND_CATEGORY,
        }))
    }
    return [
        { dataKey: COMBINED_COUNT_KEY, name: null, kind: DATA_KEY_KIND_COUNT },
    ]
}

export const getFeatureCategoryKey = (layer, props) => {
    if (layer.layer === FACILITY_LAYER || layer.layer === ORG_UNIT_LAYER) {
        return (
            props.dimensions?.[layer.organisationUnitGroupSet?.id] ??
            UNCLASSIFIED_CATEGORY_KEY
        )
    }
    if (layer.layer === EVENT_LAYER) {
        return String(props.colorGroup)
    }
    return UNCLASSIFIED_CATEGORY_KEY
}

const getThematicCombinedValueDataKeys = (layer, externalPeriod) => {
    const { renderingStrategy, periods } = layer
    if (!renderingStrategy || renderingStrategy === RENDERING_STRATEGY_SINGLE) {
        return [
            {
                dataKey: COMBINED_VALUE_KEY,
                name: null,
                kind: DATA_KEY_KIND_VALUE,
            },
        ]
    }

    const periodValueKeys = (periods ?? []).map((period) => ({
        dataKey: `period_${period.id}_${COMBINED_VALUE_KEY}`,
        name: null,
        kind: DATA_KEY_KIND_VALUE,
        periodId: period.id,
        periodName: period.name,
        settingsKey: COMBINED_VALUE_KEY,
        defaultHidden: true,
    }))

    if (renderingStrategy !== RENDERING_STRATEGY_TIMELINE) {
        return periodValueKeys
    }

    return [
        {
            dataKey: COMBINED_VALUE_KEY,
            name: null,
            kind: DATA_KEY_KIND_VALUE,
            periodId: externalPeriod?.id,
            periodName: externalPeriod?.name,
            isCurrentPeriod: true,
            settingsKey: COMBINED_VALUE_KEY,
        },
        ...periodValueKeys,
    ]
}

export const getCombinedLegendConfig = (layer, externalPeriod) => {
    if (layer.layer === EARTH_ENGINE_LAYER) {
        return null
    }
    if (
        layer.layer !== THEMATIC_LAYER ||
        !layer.renderingStrategy ||
        layer.renderingStrategy === RENDERING_STRATEGY_SINGLE
    ) {
        return { periodId: null, periodName: null, isCurrentPeriod: false }
    }
    if (layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE) {
        return {
            periodId: externalPeriod?.id ?? null,
            periodName: externalPeriod?.name ?? null,
            isCurrentPeriod: true,
        }
    }
    // SPLIT_BY_PERIOD: no single period to show a legend for
    return null
}

export const getCombinedValueDataKeys = (layer, externalPeriod) => {
    if (layer.layer === FACILITY_LAYER || layer.layer === ORG_UNIT_LAYER) {
        return getOrgUnitGroupValueDataKeys(layer)
    }
    if (layer.layer === EVENT_LAYER) {
        return getEventValueDataKeys(layer)
    }
    if (layer.layer === TRACKED_ENTITY_LAYER) {
        return [
            {
                dataKey: COMBINED_COUNT_KEY,
                name: null,
                kind: DATA_KEY_KIND_COUNT,
            },
        ]
    }
    if (layer.layer === THEMATIC_LAYER) {
        return getThematicCombinedValueDataKeys(layer, externalPeriod)
    }
    if (layer.layer !== EARTH_ENGINE_LAYER) {
        return [
            {
                dataKey: COMBINED_VALUE_KEY,
                name: null,
                kind: DATA_KEY_KIND_VALUE,
            },
        ]
    }
    if (
        CLASSIFIED_EARTH_ENGINE_AGGREGATION_TYPES.has(layer.aggregationType) &&
        layer.legend?.items
    ) {
        return layer.legend.items.map(({ value, name }) => ({
            dataKey: String(value),
            name,
            kind: DATA_KEY_KIND_VALUE,
        }))
    }
    if (Array.isArray(layer.aggregationType) && layer.aggregationType.length) {
        return layer.aggregationType
            .map((type) => ({
                dataKey: type,
                name: toTitleCase(
                    `${type} ${layer.legend?.title ?? ''}`.trim()
                ),
                kind: DATA_KEY_KIND_VALUE,
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

export const isDataTableOpen = ({ openIds, combinedView, isPanelVisible }) =>
    isPanelVisible && (openIds.length > 0 || combinedView)

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
