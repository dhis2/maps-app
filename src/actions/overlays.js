import * as types from '../constants/actionTypes';
import { closeContextMenu } from './map';
import { loading, loaded } from './loading';
import { fetchOverlay } from '../loaders/overlays';
import { dimConf } from '../constants/dimension';

// Add new overlay
export const addOverlay = (layer) => ({
    type: types.OVERLAY_ADD,
    payload: layer,
});

// Remove an overlay
export const removeOverlay = (id) => ({
    type: types.OVERLAY_REMOVE,
    id,
});

// Edit overlay
export const editOverlay = (layer) => ({
    type: types.OVERLAY_EDIT,
    payload: layer
});

// Cancel overlay (stop editing)
export const cancelOverlay = () => ({
    type: types.OVERLAY_CANCEL,
});

// Update existing overlay
export const updateOverlay = (layer) => ({
    type: types.OVERLAY_UPDATE,
    id: layer.id,
    payload: layer,
});

// Update existing overlay
export const requestOverlayLoad = (id) => ({
    type: types.OVERLAY_LOAD_REQUESTED,
    id: layer.id,
});

// Load overlay data
// http://redux.js.org/docs/advanced/AsyncActions.html
export const getOverlay = (layer) => (dispatch) => {
    dispatch(loading());

    return fetchOverlay(layer).then(layer => {
        layer.editCounter++;

        if (layer.editCounter === 1) { // Add new layer
            dispatch(addOverlay(layer));
        } else { // Update existing layer
            dispatch(updateOverlay(layer));
        }

        dispatch(loaded());
    });
};

// Expand/collapse overlay card
export const toggleOverlayExpand = (id) => ({
    type: types.OVERLAY_TOGGLE_EXPAND,
    id,
});

// Show/hide overlay on map
export const toggleOverlayVisibility = (id) => ({
    type: types.OVERLAY_TOGGLE_VISIBILITY,
    id,
});

// Set overlay opacity
export const changeOverlayOpacity = (id, opacity) => ({
    type: types.OVERLAY_CHANGE_OPACITY,
    id,
    opacity,
});

// Change ordering of overlays
export const sortOverlays = ({oldIndex, newIndex}) => ({
    type: types.OVERLAY_SORT,
    oldIndex,
    newIndex,
});

// Drill
export const drillOverlay = (layerId, parentId, parentGraph, level) => (dispatch, getState) => {
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
export const openOverlaysDialog = () => ({
    type: types.OVERLAYS_DIALOG_OPEN_REQUESTED,
});

// Close overlay selection dialog
export const closeOverlaysDialog = () => ({
    type: types.OVERLAYS_DIALOG_CLOSE_REQUESTED,
});