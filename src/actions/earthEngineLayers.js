// import log from 'loglevel'
import * as types from '../constants/actionTypes.js'
import { earthEngineLayers } from '../constants/earthEngine.js'

export const addEarthEngineLayer = (payload) => ({
    type: types.EARTH_ENGINE_LAYER_ADD,
    payload,
})

export const removeEarthEngineLayer = (payload) => ({
    type: types.EARTH_ENGINE_LAYER_REMOVE,
    payload,
})

// TODO: Move to constants
export const MAPS_APP_NAMESPACE = 'MAPS_APP'
export const EARTH_ENGINE_LAYERS_KEY = 'EARTH_ENGINE_LAYERS'

const resource = `dataStore/${MAPS_APP_NAMESPACE}`

export const tSetEarthEngineLayers = (engine) => async (dispatch) => {
    const addLayer = (layer) => dispatch(addEarthEngineLayer(layer))

    engine
        .query({
            layers: {
                resource: `${resource}/${EARTH_ENGINE_LAYERS_KEY}`,
            },
        })
        .then(({ layers }) => {
            earthEngineLayers
                .filter((l) => layers.includes(l.layerId))
                .map(addLayer)
        })
        .catch((error) => {
            console.log('error', error)
        })
}
