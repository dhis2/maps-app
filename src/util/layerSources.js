import i18n from '@dhis2/d2-i18n'
import { getEarthEngineLayer } from '../constants/earthEngineLayers/index.js'
import {
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
    EARTH_ENGINE_LAYER,
    EXTERNAL_LAYER,
    GEOJSON_URL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    GEOJSON_LAYER,
    VECTOR_STYLE,
    BING_LAYER,
    AZURE_LAYER,
} from '../constants/layers.js'

export const resolveGroupKey = (layer) => {
    return (
        layer?.grouping?.group.id ?? // If part of a group, use the group's ID ('population', 'temperature').
        layer?.layerId ?? // Else if single ee layer, use its layerId ('USGS/SRTMGL1_003').
        layer?.config?.id ?? // Else if external/custom layer, use config.id ('suB1SFdc6RD').
        layer?.layer // Else fallback to layer ('thematic', 'event').
    )
}

export const getLayerSourceGrouping = (layerId, layers = []) => {
    const grouping = {}
    const dataset = getEarthEngineLayer(layerId)
    if (!dataset?.grouping?.group) {
        return grouping
    }
    const { id: groupId, type: groupType } = dataset.grouping.group
    const { id: subGroupId, type: subGroupType } =
        dataset.grouping.subGroup || {}

    const mappedLayers = layers.map(getEarthEngineLayer).filter(Boolean)
    const allSources = mappedLayers.find(
        ({ layerId }) => layerId === dataset.layerId
    )
        ? mappedLayers
        : [dataset, ...mappedLayers]
    const grouped = groupLayerSources(allSources)

    const group = grouped.find((g) => g.id === groupId)
    grouping[groupType] = {
        id: subGroupId ?? layerId,
        group: group,
    }
    if (group) {
        const subGroup = group.items.find((sg) => sg.id === subGroupId)
        grouping[subGroupType] = { id: layerId, group: subGroup }
    }
    return grouping
}

const ensureGroup = (groups, layer) => {
    const g = layer.grouping.group
    if (!groups[g.id]) {
        groups[g.id] = { ...g, items: [] }
    }
    return groups[g.id]
}

const ensureSubGroup = (group, layer) => {
    const g = layer.grouping.subGroup || {}
    const subId = g.id || '__default__'
    let subGroup = group.items.find((sg) => sg.id === subId)
    if (!subGroup) {
        subGroup = { ...g, id: subId, items: [] }
        group.items.push(subGroup)
    }
    return subGroup
}

const addLayer = (subGroup, layer) => {
    if (!subGroup.items.some((l) => l.layerId === layer.layerId)) {
        subGroup.items.push({ id: layer.layerId, ...layer })
    }
}

const simplifyDefaultSubGroups = (groups) => {
    return groups.map((group) => {
        if (group.items?.length === 1 && group.items[0].id === '__default__') {
            group.items = group.items[0].items
        }
        return group
    })
}

export const groupLayerSources = (layers) => {
    const groups = {}
    for (const layer of layers) {
        const g = layer.grouping
        if (!g) {
            groups[resolveGroupKey(layer)] = { ...layer }
            continue
        }
        const group = ensureGroup(groups, layer)
        const subGroup = ensureSubGroup(group, layer)
        addLayer(subGroup, layer)
    }

    let groupedArray = Object.values(groups)
    groupedArray = simplifyDefaultSubGroups(groupedArray)

    return groupedArray
}

/* ------------------------------------------------------------------------- *
 * Layer catalog helpers (pinned zone + filterable list)
 * ------------------------------------------------------------------------- */

// Identity for one entry in the displayed catalog. Grouped Earth Engine entries
// produced by groupLayerSources() carry their own `id`; everything else falls
// back to resolveGroupKey (layerId / config.id / layer).
export const getLayerSourceId = (entry) => entry?.id ?? resolveGroupKey(entry)

// Built-in layer types carry `type`, everything else carries `name`
export const getLayerSourceLabel = (entry) => entry?.name || entry?.type || ''

// Grouped entries carry no description of their own - the text lives on the
// individual layers inside, so fall back to the first descendant that has one
const findNestedDescription = (entry) => {
    for (const item of entry?.items ?? []) {
        if (item?.description) {
            return item.description
        }
        const nested = findNestedDescription(item)
        if (nested) {
            return nested
        }
    }
    return ''
}

export const getLayerSourceDescription = (entry) => {
    const own = [entry?.description, entry?.descriptionComplement]
        .filter(Boolean)
        .join(' ')
    return own || findNestedDescription(entry)
}

export const KIND_BUILT_IN = 'builtIn'
export const KIND_EARTH_ENGINE = 'earthEngine'
export const KIND_EXTERNAL = 'external'

export const getLayerSourceKind = (entry) => {
    // Grouped entries only ever come from Earth Engine grouping
    if (entry?.items || entry?.layer === EARTH_ENGINE_LAYER) {
        return KIND_EARTH_ENGINE
    }
    if (entry?.layer === EXTERNAL_LAYER || entry?.layer === GEOJSON_URL_LAYER) {
        return KIND_EXTERNAL
    }
    return KIND_BUILT_IN
}

export const getLayerSourceKindLabel = (kind) =>
    ({
        [KIND_BUILT_IN]: i18n.t('Built-in'),
        [KIND_EARTH_ENGINE]: i18n.t('Earth Engine'),
        [KIND_EXTERNAL]: i18n.t('External data'),
    }[kind] || kind)

// PROTOTYPE ONLY - placement is orthogonal to kind: OSM Light is built-in +
// basemap, a registered WMS basemap is external + basemap. Entries are tagged
// with `placement` where the catalog composes them; anything untagged is an
// overlay, which is what every pre-existing caller assumes.
export const PLACEMENT_OVERLAY = 'overlay'
export const PLACEMENT_BASEMAP = 'basemap'

export const getLayerSourcePlacement = (entry) =>
    entry?.placement ?? PLACEMENT_OVERLAY

export const getLayerSourcePlacementLabel = (placement) =>
    ({
        [PLACEMENT_OVERLAY]: i18n.t('Overlay'),
        [PLACEMENT_BASEMAP]: i18n.t('Basemap'),
    }[placement] || placement)

// The 5 built-in layer types are pinned by default
export const DEFAULT_PINNED_IDS = [
    THEMATIC_LAYER,
    EVENT_LAYER,
    TRACKED_ENTITY_LAYER,
    FACILITY_LAYER,
    ORG_UNIT_LAYER,
]

const getSearchableText = (entry) =>
    [
        getLayerSourceLabel(entry),
        getLayerSourceDescription(entry),
        // Match on the contents of a group too, so filtering for "rainfall"
        // still surfaces the Precipitation group that contains it
        ...(entry?.items ?? []).flatMap((sub) => [
            getLayerSourceLabel(sub),
            getLayerSourceDescription(sub),
            ...(sub?.items ?? []).flatMap((layer) => [
                getLayerSourceLabel(layer),
                getLayerSourceDescription(layer),
            ]),
        ]),
    ].join(' ')

export const matchesLayerSourceFilter = (entry, filter) => {
    const needle = filter?.trim().toLowerCase()
    if (!needle) {
        return true
    }
    return getSearchableText(entry).toLowerCase().includes(needle)
}

export const getLayerSourceDataTest = (label) =>
    `addlayeritem-${String(label).toLowerCase().replaceAll(/\s/g, '_')}`

// Id used by the manage dialog, where Earth Engine layers are listed
// individually rather than collapsed into their group. Deliberately skips the
// grouping branch of resolveGroupKey so sibling layers stay distinct.
// Built-in basemaps carry none of the first three and fall back to `id`.
export const getManagedLayerSourceId = (entry) =>
    entry?.layerId ?? entry?.config?.id ?? entry?.layer ?? entry?.id

// Short type label for external layers, derived from the config the
// externalMapLayers endpoint already gives us
const EXTERNAL_TYPE_LABELS = {
    [TILE_LAYER]: i18n.t('XYZ tiles'),
    [WMS_LAYER]: i18n.t('WMS'),
    [GEOJSON_LAYER]: i18n.t('GeoJSON'),
    [VECTOR_STYLE]: i18n.t('Vector style'),
    [BING_LAYER]: i18n.t('Bing'),
    [AZURE_LAYER]: i18n.t('Azure'),
}

const getUrlHost = (url) => {
    try {
        return new URL(url).host
    } catch {
        return ''
    }
}

// Grouped entries carry no fields of their own, same as descriptions - fall
// back to the first descendant that has something to say
const findNestedMeta = (entry) => {
    for (const item of entry?.items ?? []) {
        const meta = getLayerSourceMeta(item)
        if (meta.length) {
            return meta
        }
    }
    return []
}

// Per-kind metadata for a catalog row. Everything here is already present on
// the layer definitions - no extra requests, no backend changes.
export const getLayerSourceMeta = (entry) => {
    const kind = getLayerSourceKind(entry)

    if (kind === KIND_EARTH_ENGINE) {
        const { source, resolution = {}, unit, periodType } = entry ?? {}
        const own = [
            source && { label: i18n.t('Source'), value: source },
            resolution.spatial && {
                label: i18n.t('Resolution'),
                value: resolution.spatial,
            },
            resolution.temporal && {
                label: i18n.t('Updated'),
                value: resolution.temporal,
            },
            resolution.temporalCoverage && {
                label: i18n.t('Coverage'),
                value: resolution.temporalCoverage,
            },
            unit && { label: i18n.t('Unit'), value: unit },
            !resolution.temporal &&
                periodType && {
                    label: i18n.t('Period'),
                    value: periodType,
                },
        ].filter(Boolean)

        return own.length ? own : findNestedMeta(entry)
    }

    // Any entry with a renderable config gets Service/Host chips - that covers
    // external layers and built-in basemaps alike
    if (entry?.config?.type) {
        // Deliberately skips config.attribution - it's raw HTML meant for the
        // map's attribution control, not display text, so it isn't safe to
        // render here
        const { type, url, tms } = entry?.config ?? {}
        const host = getUrlHost(url)
        return [
            type && {
                label: i18n.t('Service'),
                // TMS and XYZ both become TILE_LAYER - only config.tms tells them apart
                value:
                    type === TILE_LAYER && tms
                        ? i18n.t('TMS tiles')
                        : EXTERNAL_TYPE_LABELS[type] || type,
            },
            host && { label: i18n.t('Host'), value: host },
        ].filter(Boolean)
    }

    return []
}
