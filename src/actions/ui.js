import * as types from '../constants/actionTypes';

export const resizeScreen = (width, height) => ({
    type: types.SCREEN_RESIZE,
    width,
    height,
});

export const closeLayersPanel = id => ({
    type: types.LAYERS_PANEL_CLOSE,
});

export const openLayersPanel = () => ({
    type: types.LAYERS_PANEL_OPEN,
});

export const closeRightPanel = id => ({
    type: types.RIGHT_PANEL_CLOSE,
});

export const openRightPanel = () => ({
    type: types.RIGHT_PANEL_OPEN,
});
