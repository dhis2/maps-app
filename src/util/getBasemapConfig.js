import { getBasemapList, getBasemapOrFallback } from './basemaps.js'
import { EXTERNAL_MAP_LAYERS_QUERY } from './requests.js'
import { isValidUid } from './uid.js'

const getExternalMapLayers = async ({
    engine,
    basemapId,
    defaultBasemapId,
}) => {
    if (!(isValidUid(basemapId) || isValidUid(defaultBasemapId))) {
        return []
    }

    try {
        const { externalLayers } = await engine.query({
            externalLayers: EXTERNAL_MAP_LAYERS_QUERY,
        })

        return externalLayers.externalMapLayers
    } catch (error) {
        console.warn('Failed to fetch external basemaps:', error)
        return []
    }
}

const getBasemapConfig = async ({
    basemapId,
    basemapVisible,
    keyDefaultBaseMap,
    systemSettings,
    engine,
}) => {
    const externalMapLayers = await getExternalMapLayers({
        engine,
        basemapId,
        defaultBasemapId: keyDefaultBaseMap,
    })
    const basemaps = await getBasemapList({ externalMapLayers, systemSettings })

    const basemap = getBasemapOrFallback({
        basemaps,
        id: basemapId,
        defaultId: keyDefaultBaseMap,
        onMissing: (msg) => console.warn(msg),
    })

    if (typeof basemapVisible === 'boolean') {
        basemap.isVisible = basemapVisible
    }

    return {
        basemap,
    }
}

export default getBasemapConfig
