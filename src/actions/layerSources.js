import * as types from '../constants/actionTypes.js'

// Initialize visible layerSources
export const initLayerSources = (newArray) => ({
    type: types.LAYER_SOURCES_INIT,
    payload: newArray,
})

// Add layerSource
export const addLayerSource = (id) => ({
    type: types.LAYER_SOURCE_ADD,
    payload: id,
})

// Remove layerSource
export const removeLayerSource = (id) => ({
    type: types.LAYER_SOURCE_REMOVE,
    payload: id,
})
