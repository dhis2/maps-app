import * as types from '../constants/actionTypes';

// Add external overlay
export const addExternalLayer = layer => ({
    type: types.EXTERNAL_LAYER_ADD,
    payload: layer,
});

// Remove external overlay
export const removeExternalLayer = id => ({
    type: types.EXTERNAL_LAYER_REMOVE,
    id,
});

// Load all external layers
export const loadExternalLayers = () => ({
    type: types.EXTERNAL_LAYERS_LOAD,
});
