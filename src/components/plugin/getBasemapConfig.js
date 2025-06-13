import {
    getFallbackBasemap,
    defaultBasemaps,
} from '../../constants/basemaps.js'
import {
    MAP_LAYER_POSITION_BASEMAP,
    LAYERS_TO_KEY_MAP,
} from '../../constants/layers.js'
import { createExternalBasemapLayer } from '../../util/external.js'
import { EXTERNAL_MAP_LAYERS_QUERY } from '../../util/requests.js'
import { isValidUid } from '../../util/uid.js'

async function getBasemaps(basemapId, defaultBasemapId, engine) {
    try {
        let externalBasemaps = []
        if (isValidUid(basemapId) || isValidUid(defaultBasemapId)) {
            const { externalLayers } = await engine.query({
                externalLayers: EXTERNAL_MAP_LAYERS_QUERY,
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
    systemSettings,
    engine,
}) {
    const basemaps = await getBasemaps(basemapId, keyDefaultBaseMap, engine)

    const basemap =
        basemaps.find(({ id }) => id === basemapId) ||
        basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
        getFallbackBasemap()

    if (LAYERS_TO_KEY_MAP[basemap.config.type]) {
        basemap.config.apiKey =
            systemSettings[LAYERS_TO_KEY_MAP[basemap.config.type]]
    }
    if (typeof basemapVisible === 'boolean') {
        basemap.isVisible = basemapVisible
    }
    return {
        basemap,
    }
}

export default getBasemapConfig
