import { isString, isObject, sortBy } from 'lodash/fp'
import { EXTERNAL_LAYER, EVENT_CENTROID_DEFAULT } from '../constants/layers.js'

export const getMigratedMapConfig = (config, defaultBasemapId) =>
    upgradeMapViews(
        upgradeGisAppLayers(extractBasemap(config, defaultBasemapId))
    )

// Different ways of specifying a basemap - TODO: simplify!
const extractBasemap = (config, defaultBasemapId) => {
    const externalBasemap = config.mapViews.find(
        (view) =>
            view.layer === EXTERNAL_LAYER &&
            JSON.parse(view.config || {}).mapLayerPosition === 'BASEMAP'
    )
    let basemap
    let mapViews = config.mapViews

    if (externalBasemap) {
        basemap = JSON.parse(externalBasemap.config)
        mapViews = config.mapViews.filter(
            (view) => view.id !== externalBasemap.id
        )
    } else if (Array.isArray(config.basemaps) && config.basemaps.length > 0) {
        const { id, opacity, hidden } = config.basemaps[0]
        basemap = {
            id: id || defaultBasemapId,
            opacity: opacity ?? 1,
            isVisible: !hidden,
        }
    } else if (isString(config.basemap)) {
        if (config.basemap === 'none') {
            basemap = { id: defaultBasemapId, isVisible: false }
        } else {
            try {
                // JSON-encoded config with opacity and id when hidden
                const parsed = JSON.parse(config.basemap)
                basemap = {
                    id: parsed.id || defaultBasemapId,
                    opacity: parsed.opacity ?? 1,
                    isVisible: !parsed.hidden,
                }
            } catch {
                // Plain basemap ID saved before JSON encoding
                basemap = { id: config.basemap }
            }
        }
    } else if (isObject(config.basemap)) {
        basemap = config.basemap
    } else {
        basemap = { id: defaultBasemapId }
    }

    return {
        ...config,
        basemap: basemap,
        mapViews: mapViews,
    }
}

// Detection if map config is from previous GIS app
// TODO: Better to store app version as part of config object?

// Layer order in the previous GIS app (bottom to top)
const gisAppLayerOrder = {
    externalLayer: 1, // TODO: Distinguish between basemaps and overlays
    earthEngine: 2,
    thematic4: 3,
    thematic3: 4,
    thematic2: 5,
    thematic1: 6,
    boundary: 7,
    facility: 8,
    event: 9,
}

const isGisAppFormat = (layers) =>
    layers.some((config) => config.layer.match(/thematic[1-4]/))

const upgradeGisAppLayers = (config) => {
    const { mapViews } = config
    if (!isGisAppFormat(mapViews)) {
        return config
    }

    const updatedMapViews = sortBy(
        (mapView) => gisAppLayerOrder[mapView.layer],
        mapViews
    ).map((orderedMapView) => ({
        ...orderedMapView,
        layer: orderedMapView.layer.replace(/\d$/, ''), // Remove thematic number used in previous versions
    }))

    return {
        ...config,
        mapViews: updatedMapViews,
    }
}

const upgradeMapViews = (config) => {
    const needsLegacyUpgrade = config.mapViews.some(
        (view) =>
            view.layer === 'boundary' ||
            typeof view.colorScale === 'string' ||
            view.geometryCentroid === undefined
    )

    const upgradedViews = config.mapViews.map((view) => {
        let layer = view.layer
        let colorScale = view.colorScale

        if (needsLegacyUpgrade) {
            if (layer === 'boundary') {
                layer = 'orgUnit'
            }
            if (
                view.geometryCentroid === undefined &&
                view.layer === 'event' &&
                !EVENT_CENTROID_DEFAULT.includes(view.eventCoordinateField)
            ) {
                // We should test !EVENT_CENTROID_DEFAULT.includes(view.eventCoordinateFieldType) but it is not currently saved with the mapView.
                // This will set geometryCentroid: true when eventCoordinateField is a DE/TEA of type 'COORDINATE' too, which is unnecessary but harmless.
                view.geometryCentroid = true
            }
            if (typeof colorScale === 'string') {
                const parts = colorScale.split(',')
                colorScale = parts.length === 1 ? parts[0] : parts
            }
        }

        return {
            ...view,
            layer,
            colorScale,
            isVisible: view.hidden !== true,
        }
    })

    return {
        ...config,
        mapViews: upgradedViews,
    }
}
