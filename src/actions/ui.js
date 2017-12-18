import * as types from '../constants/actionTypes';

export const resizeScreen = (width, height) => ({
    type: types.SCREEN_RESIZE,
    width,
    height,
});

export const closeLayersPanel = (id) => ({
    type: types.LAYERS_PANEL_CLOSE_REQUESTED,
});

export const openLayersPanel = () => ({
    type: types.LAYERS_PANEL_OPEN_REQUESTED,
});