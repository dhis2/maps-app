import * as types from '../constants/actionTypes';

export const resizeScreen = (width, height) => ({
    type: types.SCREEN_RESIZE,
    width,
    height,
});

export const closeLayersPanel = (id) => ({
    type: types.LAYERS_PANEL_CLOSE,
});

export const openLayersPanel = () => ({
    type: types.LAYERS_PANEL_OPEN,
});

export const openFavoritesDialog = () => ({
    type: types.FAVORITES_DIALOG_OPEN,
});

export const closeFavoritesDialog = () => ({
    type: types.FAVORITES_DIALOG_CLOSE,
});

export const openSaveFavoriteDialog = () => ({
  type: types.FAVORITE_SAVE_DIALOG_OPEN,
});

export const closeSaveFavoriteDialog = () => ({
  type: types.FAVORITE_SAVE_DIALOG_CLOSE,
});