import { isValidUid } from 'd2/uid'
import {
    getFallbackBasemap,
    defaultBasemaps,
} from '../../constants/basemaps.js'
import { createExternalLayer } from '../../util/external.js'
import { fetchExternalLayersQuery } from '../../util/requests.js'

async function getBasemaps(basemapId, defaultBasemapId, engine) {
    try {
        let externalBasemaps = []
        if (isValidUid(basemapId) || isValidUid(defaultBasemapId)) {
            const externalLayers = await engine.query({
                externalLayers: fetchExternalLayersQuery,
            })
            externalBasemaps = externalLayers
                .filter((layer) => layer.mapLayerPosition === 'BASEMAP')
                .map(createExternalLayer)
        }

        return defaultBasemaps().concat(externalBasemaps)
    } catch (e) {
        return defaultBasemaps()
    }
}

async function getBasemapConfig({
    basemapId,
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
    return {
        basemap,
    }
}

export default getBasemapConfig
