import * as types from '../constants/actionTypes';
import { closeContextMenu } from './map';
import { loading, loaded } from './loading';
import { fetchOverlay } from '../loaders/overlays';
import { dimConf } from '../constants/dimension';

// Add new layer
export const addLayer = (config) => ({
    type: types.LAYER_ADD,
    payload: config,
});

// Remove an overlay
export const removeLayer = (id) => ({
    type: types.LAYER_REMOVE,
    id,
});

// Edit overlay
export const editLayer = (layer) => ({
    type: types.LAYER_EDIT,
    payload: layer
});

// Cancel overlay (stop editing)
export const cancelLayer = () => ({
    type: types.LAYER_CANCEL,
});

// Update existing overlay
export const updateLayer = (layer) => ({
    type: types.LAYER_UPDATE,
    id: layer.id,
    payload: layer,
});

// Update existing overlay
export const requestOverlayLoad = (id) => ({
    type: types.LAYER_LOAD_REQUESTED,
    id: layer.id,
});

// Load overlay data
// http://redux.js.org/docs/advanced/AsyncActions.html
export const getLayer = (layer) => (dispatch) => {
    dispatch(loading());

    return fetchOverlay(layer).then(layer => {
        layer.editCounter++;

        if (layer.editCounter === 1) { // Add new layer
            dispatch(addLayer(layer));
        } else { // Update existing layer
            dispatch(updateLayer(layer));
        }

        dispatch(loaded());
    });
};

// Expand/collapse overlay card
export const toggleLayerExpand = (id) => ({
    type: types.LAYER_TOGGLE_EXPAND,
    id,
});

// Show/hide overlay on map
export const toggleLayerVisibility = (id) => ({
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
export const sortLayers = ({oldIndex, newIndex}) => ({
    type: types.LAYER_SORT,
    oldIndex,
    newIndex,
});

// Drill
export const drillLayer = (layerId, parentId, parentGraph, level) => (dispatch, getState) => {
    dispatch(closeContextMenu());

    const state = getState();
    const layer = state.map.overlays.filter(overlay => overlay.id === layerId)[0]; // TODO: Add check

    const overlay = {
        ...layer,
        rows: [{
            dimension: dimConf.organisationUnit.objectName,
            items: [
                {id: parentId},
                {id: 'LEVEL-' + level}
            ]
        }],
        parentGraphMap: {}
    };

    layer.parentGraphMap[parentId] = parentGraph;

    // console.log('DRILL', overlay);
    // dispatch(updateOverlay(overlay));

    dispatch(getOverlay(overlay));
};

// Open overlay selection dialog
export const openLayersDialog = () => ({
    type: types.LAYERS_DIALOG_OPEN_REQUESTED,
});

// Close overlay selection dialog
export const closeLayersDialog = () => ({
    type: types.LAYERS_DIALOG_CLOSE_REQUESTED,
});