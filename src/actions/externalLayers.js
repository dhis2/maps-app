import * as types from '../constants/actionTypes';

// Add external overlay
export const addExternalLayer = layer => ({
    type: types.EXTERNAL_LAYER_ADD,
    payload: layer,
});
