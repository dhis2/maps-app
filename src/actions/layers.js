import * as types from '../constants/actionTypes';

// Add new layer
export const addLayer = config => ({
    type: types.LAYER_ADD,
    payload: config,
});

// Remove an overlay
export const removeLayer = id => ({
    type: types.LAYER_REMOVE,
    id,
});

// Edit overlay
export const editLayer = layer => ({
    type: types.LAYER_EDIT,
    payload: layer,
});

// Cancel overlay (stop editing)
export const cancelLayer = () => ({
    type: types.LAYER_CANCEL,
});

// Update existing overlay
export const updateLayer = layer => ({
    type: types.LAYER_UPDATE,
    payload: layer,
});

// Load layer data
export const loadLayer = layer => ({
    type: types.LAYER_LOAD,
    payload: layer,
});

// Expand/collapse overlay card
export const toggleLayerExpand = id => ({
    type: types.LAYER_TOGGLE_EXPAND,
    id,
});

// Show/hide overlay on map
export const toggleLayerVisibility = id => ({
    type: types.LAYER_TOGGLE_VISIBILITY,
    id,
});

// Set overlay opacity
export const changeLayerOpacity = (id, opacity) => ({
    type: types.LAYER_CHANGE_OPACITY,
    id,
    opacity,
});

// Change ordering of overlays
export const sortLayers = ({ oldIndex, newIndex }) => ({
    type: types.LAYER_SORT,
    oldIndex,
    newIndex,
});

// Add new layer
export const drillLayer = (layerId, parentId, parentGraph, level) => ({
    type: types.LAYER_DRILL,
    layerId,
    parentId,
    parentGraph,
    level,
});

// Set that layer is loading
export const setLayerLoading = id => ({
    type: types.LAYER_LOADING_SET,
    id,
});
