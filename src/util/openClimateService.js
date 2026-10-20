import { scale } from 'chroma-js'
import { OPEN_CLIMATE_SERVICE_LAYER } from '../constants/layers.js'
import {
    MAPS_APP_NAMESPACE,
    MAPS_APP_KEY_OPEN_CLIMATE_SERVICE,
} from '../constants/settings.js'

// Client for an Open Climate Service (OCS) instance. Published datasets are
// listed in the instance's STAC catalog, and each raster collection points to
// a GeoZarr store that is rendered in the browser (see ZarrLayer.js).
// Mirrors the OCS map viewer, so a dataset looks the same in both places.

export const OPEN_CLIMATE_SERVICE_RESOURCE = `dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_OPEN_CLIMATE_SERVICE}`

// Used until an administrator links another instance. Its datasets are still off by default.
export const DEFAULT_OPEN_CLIMATE_SERVICE_URL =
    'https://ocs-demo-nepal.dhis2.org'

const MAX_STEPS = 50000
const LEGEND_CLASSES = 7

// Trims whitespace and trailing slashes
export const normalizeUrl = (url = '') => {
    let normalized = url.trim()
    while (normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1)
    }
    return normalized
}

// Returns { url, enabled } for the linked OCS, or null if no instance is linked
export const fetchOpenClimateServiceSettings = async (engine) => {
    try {
        const { settings } = await engine.query({
            settings: { resource: OPEN_CLIMATE_SERVICE_RESOURCE },
        })
        return settings?.url
            ? { ...settings, url: normalizeUrl(settings.url) }
            : null
    } catch {
        return null // Key is missing
    }
}

export const fetchOpenClimateServiceUrl = async (engine) =>
    (await fetchOpenClimateServiceSettings(engine))?.url ||
    DEFAULT_OPEN_CLIMATE_SERVICE_URL

const fetchJson = async (url) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`)
    }
    return response.json()
}

export const fetchCollection = (url, datasetId) =>
    fetchJson(`${url}/stac/collections/${encodeURIComponent(datasetId)}`)

// Raster collections have a Zarr asset
export const isRasterCollection = (collection) =>
    Boolean(collection?.assets?.zarr?.href)

// Vector collections can be shown when they have vector tiles and a style
export const isVectorCollection = (collection) =>
    Boolean(collection?.assets?.tiles?.href && collection?.assets?.style?.href)

const collectionsCache = {}

// Published collections of an instance that can be shown on a map, fetched once per url
export const fetchCollections = (url) => {
    if (!collectionsCache[url]) {
        collectionsCache[url] = fetchJson(`${url}/stac`)
            .then((catalog) =>
                Promise.all(
                    (catalog.links || [])
                        .filter((link) => link.rel === 'child')
                        .map((link) => fetchJson(link.href).catch(() => null))
                )
            )
            .then((collections) =>
                collections.filter(
                    (c) => isRasterCollection(c) || isVectorCollection(c)
                )
            )
            .catch((error) => {
                delete collectionsCache[url]
                throw error
            })
    }
    return collectionsCache[url]
}

// A collection as an entry in the add layer popover
export const getLayerSource = (collection) => ({
    layer: OPEN_CLIMATE_SERVICE_LAYER,
    layerId: `${OPEN_CLIMATE_SERVICE_LAYER}:${collection.id}`,
    name: collection.title || collection.id,
    img: collection.assets?.thumbnail?.href,
    description: collection.description,
    source: 'Open Climate Service',
    config: { datasetId: collection.id },
})

export const fetchStyle = (collection) =>
    fetchJson(collection.assets.style.href)

const getBounds = (collection) => {
    const [x1, y1, x2, y2] = collection.extent?.spatial?.bbox?.[0] || []
    return x1 === undefined
        ? null
        : [
              [x1, y1],
              [x2, y2],
          ] // WGS84
}

// What the layer needs to draw a vector collection: the MapLibre style OCS
// publishes for it, over its PMTiles archive
export const getVectorOptions = (collection, style) => ({
    kind: 'vector',
    style,
    bounds: getBounds(collection),
    featureCount: collection['table:row_count'],
})

// The colour features are drawn with, for the legend
export const getVectorColor = (style) => {
    const layers = style?.layers || []
    const fill = layers.find((l) => l.type === 'fill')?.paint?.['fill-color']
    const circle = layers.find((l) => l.type === 'circle')?.paint?.[
        'circle-color'
    ]
    return typeof (fill || circle) === 'string' ? fill || circle : '#0066cc'
}

const DATE_UNITS = { Y: 'years', M: 'months', W: 'weeks', D: 'days' }
const TIME_UNITS = { H: 'hours', M: 'minutes', S: 'seconds' }

// ISO 8601 duration, e.g. P1M or P7D
const parseDuration = (iso) => {
    if (!iso.startsWith('P')) {
        return null
    }
    const [datePart, timePart = ''] = iso.slice(1).split('T')
    const duration = {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }
    const parts = [
        [datePart, DATE_UNITS],
        [timePart, TIME_UNITS],
    ]
    for (const [part, units] of parts) {
        let value = ''
        for (const char of part) {
            if (char >= '0' && char <= '9') {
                value += char
            } else if (units[char] && value) {
                duration[units[char]] = Number(value)
                value = ''
            } else {
                return null
            }
        }
        if (value) {
            return null // A number without a unit
        }
    }
    return Object.values(duration).some(Boolean) ? duration : null
}

const advance = (date, d) => {
    const next = new Date(date)
    next.setUTCFullYear(next.getUTCFullYear() + d.years)
    next.setUTCMonth(next.getUTCMonth() + d.months)
    next.setUTCDate(next.getUTCDate() + d.weeks * 7 + d.days)
    next.setUTCHours(next.getUTCHours() + d.hours)
    next.setUTCMinutes(next.getUTCMinutes() + d.minutes)
    next.setUTCSeconds(next.getUTCSeconds() + d.seconds)
    return next
}

// Expand a temporal extent by its step into date strings
const getTemporalSteps = ([start, end], step) => {
    const duration = parseDuration(String(step))
    let current = new Date(start)
    const last = new Date(end)
    if (
        !duration ||
        Number.isNaN(current.getTime()) ||
        Number.isNaN(last.getTime())
    ) {
        return []
    }
    const isSubDaily = duration.hours || duration.minutes || duration.seconds
    const steps = []
    while (current <= last && steps.length < MAX_STEPS) {
        const iso = current.toISOString()
        steps.push(isSubDaily ? iso.slice(0, 16) : iso.slice(0, 10))
        const next = advance(current, duration)
        if (next <= current) {
            break
        }
        current = next
    }
    return steps
}

const getSteps = (dim) => {
    if (Array.isArray(dim.values)) {
        return dim.values
    }
    if (dim.type === 'temporal' && Array.isArray(dim.extent)) {
        return getTemporalSteps(dim.extent, dim.step)
    }
    return []
}

// Non-spatial dimensions to select a slice from (time, month, etc.)
export const getDimensions = (collection) =>
    Object.entries(collection['cube:dimensions'] || {})
        .filter(([, dim]) => dim.type !== 'spatial' && dim.type !== 'bands')
        .map(([key, dim]) => ({
            key,
            isTemporal: dim.type === 'temporal',
            step: dim.step,
            steps: getSteps(dim),
        }))
        .filter((dim) => dim.steps.length > 0)

// Default to the latest time step and the first value of other dimensions
export const getDefaultSelection = (dimensions) =>
    Object.fromEntries(
        dimensions.map(({ key, isTemporal, steps }) => [
            key,
            isTemporal ? steps[steps.length - 1] : steps[0],
        ])
    )

// Saved selections are values (stable as a dataset grows), the layer needs indexes
export const getSelectionIndexes = (dimensions, selection = {}) => {
    const defaults = getDefaultSelection(dimensions)
    return Object.fromEntries(
        dimensions.map(({ key, steps }) => {
            const index = steps.findIndex(
                (value) => String(value) === String(selection[key])
            )
            const fallback = steps.indexOf(defaults[key])
            return [key, index === -1 ? fallback : index]
        })
    )
}

const formatMonth = (month) =>
    new Date(Date.UTC(2000, month - 1)).toLocaleDateString(undefined, {
        month: 'long',
        timeZone: 'UTC',
    })

export const formatStep = (value, { key, isTemporal, step }) => {
    if (key === 'month' && Number.isInteger(value)) {
        return formatMonth(value) // Climate normals have a month dimension
    }
    if (!isTemporal) {
        return String(value)
    }
    const date = new Date(value)
    if (step === 'P1M') {
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            timeZone: 'UTC',
        })
    }
    if (step === 'P1Y') {
        return String(date.getUTCFullYear())
    }
    return String(value)
}

export const getSelectionName = (dimensions, selection = {}) =>
    dimensions
        .map((dim) => formatStep(selection[dim.key], dim))
        .filter(Boolean)
        .join(', ')

// A colormap name (ColorBrewer/D3, `_r` reverses) as a list of colors
export const getColormap = (name = 'viridis', count = 256) => {
    const reversed = name.endsWith('_r')
    const scaleName = reversed ? name.slice(0, -2) : name
    let colors
    try {
        colors = scale(scaleName).colors(count)
    } catch {
        colors = scale('viridis').colors(count)
    }
    return reversed ? colors.reverse() : colors
}

// What the layer needs to render a collection, from its render hints
export const getRenderOptions = (collection) => {
    const render = collection.renders?.default || {}
    const zarr = collection.assets.zarr
    const variable =
        render['open_climate_service:variable'] ||
        Object.keys(collection['cube:variables'] || {})[0]
    const [min, max] = render.rescale?.[0] || [0, 100]
    let crs = collection['proj:code'] || 'EPSG:4326'

    // CRS84 aliases are geographic WGS84, which ZarrLayer knows as EPSG:4326
    if (
        crs
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .endsWith('CRS84')
    ) {
        crs = 'EPSG:4326'
    }

    return {
        kind: 'raster',
        source: zarr.href,
        variable,
        min,
        max,
        colormapName: render.colormap_name || 'viridis',
        fillValue: render.nodata ?? null,
        zarrVersion: zarr['zarr:zarr_format'] ?? null,
        crs,
        proj4: collection['open_climate_service:proj4'] ?? null,
        unit: collection['cube:variables']?.[variable]?.unit,
        bounds: getBounds(collection),
    }
}

export const getLegendColors = (colormapName) =>
    getColormap(colormapName, LEGEND_CLASSES)
