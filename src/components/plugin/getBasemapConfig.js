import {
    getFallbackBasemap,
    defaultBasemaps,
} from '../../constants/basemaps.js'
import { MAP_LAYER_POSITION_BASEMAP } from '../../constants/layers.js'
import { createExternalBasemapLayer } from '../../util/external.js'
import { fetchExternalLayersQuery } from '../../util/requests.js'
import { isValidUid } from '../../util/uid.js'

async function getBasemaps(basemapId, defaultBasemapId, engine) {
    try {
        let externalBasemaps = []
        if (isValidUid(basemapId) || isValidUid(defaultBasemapId)) {
            const { externalLayers } = await engine.query({
                externalLayers: fetchExternalLayersQuery,
            })
            externalBasemaps = externalLayers.externalMapLayers
                .filter(
                    (layer) =>
                        layer.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP
                )
                .map(createExternalBasemapLayer)
        }

        return defaultBasemaps().concat(externalBasemaps)
    } catch (e) {
        return defaultBasemaps()
    }
}

async function getBasemapConfig({
    basemapId,
    basemapVisible,
    keyDefaultBaseMap,
    keyBingMapsApiKey,
    engine,
}) {
    const basemaps = await getBasemaps(basemapId, keyDefaultBaseMap, engine)

    const basemap =
        basemaps.find(({ id }) => id === basemapId) ||
        basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
        getFallbackBasemap()

    if (basemap.id.substring(0, 4) === 'bing') {
        basemap.config.apiKey = keyBingMapsApiKey
    }
    if (basemapVisible === false) {
        basemap.isVisible = false
    }
    return {
        basemap,
    }
}

export default getBasemapConfig
