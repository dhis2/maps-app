import { isValidUid } from 'd2/uid'
import {
    getFallbackBasemap,
    defaultBasemaps,
} from '../../constants/basemaps.js'
import { fetchLayer } from '../../loaders/layers.js'
import { createExternalLayer } from '../../util/external.js'
import { fetchExternalLayers } from '../../util/requests.js'

async function getBasemaps(basemapId, defaultBasemapId, engine) {
    try {
        let externalBasemaps = []
        if (isValidUid(basemapId) || isValidUid(defaultBasemapId)) {
            const externalLayers = await fetchExternalLayers(engine)
            externalBasemaps = externalLayers
                .filter((layer) => layer.mapLayerPosition === 'BASEMAP')
                .map(createExternalLayer)
        }

        return defaultBasemaps().concat(externalBasemaps)
    } catch (e) {
        return defaultBasemaps()
    }
}

async function getConfig({
    mapViews,
    basemapId,
    keyDefaultBaseMap,
    keyBingMapsApiKey,
    engine,
}) {
    const fetchedMapViews = await Promise.all(mapViews.map(fetchLayer))
    const basemaps = await getBasemaps(basemapId, keyDefaultBaseMap, engine)

    const basemap =
        basemaps.find(({ id }) => id === basemapId) ||
        basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
        getFallbackBasemap()

    if (basemap.id.substring(0, 4) === 'bing') {
        basemap.config.apiKey = keyBingMapsApiKey
    }
    return {
        fetchedMapViews,
        basemap,
    }
}

export { getConfig }
