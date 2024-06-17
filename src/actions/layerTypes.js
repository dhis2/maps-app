import * as types from '../constants/actionTypes.js'

// Initialize visible layerTypes
export const initLayerTypes = (newArray) => ({
    type: types.LAYER_TYPES_INIT,
    payload: newArray,
})

// Show layerType
export const showLayerTypes = (id) => ({
    type: types.LAYER_TYPES_SHOW,
    payload: id,
})

// Hide layerType
export const hideLayerTypes = (id) => ({
    type: types.LAYER_TYPES_HIDE,
    payload: id,
})
