import { getFallbackBasemap } from '../../constants/basemaps.js'
import { getBasemapList } from '../../util/app.js'
import { EXTERNAL_MAP_LAYERS_QUERY } from '../../util/requests.js'
import { isValidUid } from '../../util/uid.js'

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

    let basemap = basemaps.find(({ id }) => id === basemapId)
    if (!basemap) {
        console.warn(
            `Could not load: ${basemapId} — using the default basemap instead.`
        )
        basemap =
            basemaps.find(({ id }) => id === keyDefaultBaseMap) ||
            getFallbackBasemap()
    }
    if (typeof basemapVisible === 'boolean') {
        basemap.isVisible = basemapVisible
    }
    return {
        basemap,
    }
}

export default getBasemapConfig
