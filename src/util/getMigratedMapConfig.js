import { isString, isObject, sortBy } from 'lodash/fp'
import { EXTERNAL_LAYER } from '../constants/layers.js'

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
    } else if (isString(config.basemap)) {
        basemap =
            config.basemap === 'none'
                ? { id: defaultBasemapId, isVisible: false }
                : { id: config.basemap }
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

// Change layer name from boundary to orgUnit when loading an old map
// Change colorScale from string to array
// TODO: Change in db with an upgrade script
const upgradeMapViews = (config) => {
    if (
        config.mapViews.find(
            (view) =>
                view.layer === 'boundary' || typeof view.colorScale === 'string'
        )
    ) {
        return {
            ...config,
            mapViews: config.mapViews.map((view) => ({
                ...view,
                layer: view.layer === 'boundary' ? 'orgUnit' : view.layer,
                colorScale:
                    typeof view.colorScale === 'string'
                        ? view.colorScale.split(',')
                        : view.colorScale,
            })),
        }
    } else {
        return config
    }
}
