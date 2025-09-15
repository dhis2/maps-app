import * as types from '../constants/actionTypes.js'

// Add new layer
export const addLayer = (config) => ({
    type: types.LAYER_ADD,
    payload: config,
})

// Remove an overlay
export const removeLayer = (id) => ({
    type: types.LAYER_REMOVE,
    id,
})

// Edit overlay
export const editLayer = (layer) => ({
    type: types.LAYER_EDIT,
    payload: layer,
})

// Cancel overlay (stop editing)
export const cancelLayer = () => ({
    type: types.LAYER_CANCEL,
})

// Update existing overlay
export const updateLayer = (layer) => ({
    type: types.LAYER_UPDATE,
    payload: layer,
})

// Expand/collapse overlay card
export const toggleLayerExpand = (id) => ({
    type: types.LAYER_TOGGLE_EXPAND,
    id,
})

// Show/hide overlay on map
export const toggleLayerVisibility = (id) => ({
    type: types.LAYER_TOGGLE_VISIBILITY,
    id,
})

// Set overlay opacity
export const changeLayerOpacity = (id, opacity) => ({
    type: types.LAYER_CHANGE_OPACITY,
    id,
    opacity,
})

// Set overlay heat intensity
export const changeLayerIntensity = (id, heatIntensity) => ({
    type: types.LAYER_CHANGE_INTENSITY,
    id,
    heatIntensity,
})

// Set overlay heat radius
export const changeLayerRadius = (id, heatRadius) => ({
    type: types.LAYER_CHANGE_RADIUS,
    id,
    heatRadius,
})

// Change ordering of overlays
export const sortLayers = ({ oldIndex, newIndex }) => ({
    type: types.LAYER_SORT,
    oldIndex,
    newIndex,
})

// Set that layer is loading
export const setLayerLoading = (id) => ({
    type: types.LAYER_LOADING_SET,
    id,
})
