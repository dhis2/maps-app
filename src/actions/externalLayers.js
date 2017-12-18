import * as types from '../constants/actionTypes';

// Add external overlay
export const addExternalOverlay = (layer) => ({
    type: types.EXTERNAL_OVERLAY_ADD,
    payload: layer,
});

// Remove external overlay
export const removeExternalOverlay = (id) => ({
    type: types.EXTERNAL_OVERLAY_REMOVE,
    id,
});

// Load all external layers
export const loadExternalLayers = () => ({
    type: types.EXTERNAL_LAYERS_LOAD,
});



