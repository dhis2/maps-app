// import log from 'loglevel'
import * as types from '../constants/actionTypes.js'
// import { createExternalLayer } from '../util/external.js'
// import { fetchExternalLayers } from '../util/requests.js'
// import { addBasemaps } from './basemap.js'
import { EARTH_ENGINE_LAYER } from '../constants/layers.js'

export const EXTERNAL_LAYERS_NAMESPACE = 'EXTERNAL_LAYERS'

const isBasemap = (layer) => layer.mapLayerPosition === 'BASEMAP'
const isOverlay = (layer) => !isBasemap(layer)

// Add external overlay
export const addExternalLayer = (layer) => ({
    type: types.EXTERNAL_LAYER_ADD,
    payload: layer,
})

export const tSetExternalLayers = (engine) => async (dispatch) => {
    engine
        .query({
            dataStore: {
                resource: 'dataStore',
            },
        })
        .then(({ dataStore }) => {
            if (dataStore.includes(EXTERNAL_LAYERS_NAMESPACE)) {
                engine
                    .query({
                        layerIds: {
                            resource: `dataStore/${EXTERNAL_LAYERS_NAMESPACE}`,
                        },
                    })
                    .then(({ layerIds }) => {
                        // TODO: Possible to load all layers at once?
                        Promise.all(
                            layerIds.map((layerId) =>
                                engine
                                    .query({
                                        layer: {
                                            resource: `dataStore/${EXTERNAL_LAYERS_NAMESPACE}/${layerId}`,
                                        },
                                    })
                                    .then(({ layer }) => layer)
                            )
                        ).then((layers) => {
                            layers.sort((a, b) => (a.name > b.name ? 1 : -1))
                            layers.forEach((layer) => {
                                const layerId = layer.id // TODO
                                delete layer.id // TODO
                                dispatch(
                                    addExternalLayer({
                                        ...layer,
                                        layer: EARTH_ENGINE_LAYER, // TODO
                                        layerId, // TODO
                                    })
                                )
                            })
                        })
                    })
            }
        })

    /*
    try {
        const externalLayers = await fetchExternalLayers(engine)
        const externalBasemaps = externalLayers.externalLayers.externalMapLayers
            .filter(isBasemap)
            .map(createExternalLayer)

        dispatch(addBasemaps(externalBasemaps))

        externalLayers.externalLayers.externalMapLayers
            .filter(isOverlay)
            .map(createExternalLayer)
            .map((layer) => dispatch(addExternalLayer(layer)))
    } catch (e) {
        log.error('Could not load external map layers')
        return e
    }
    */
}
