import * as types from '../constants/actionTypes';

// Load one map favorite
export const loadFavorite = (id) => ({
    type: types.FAVORITE_LOAD,
    id,
});

export const saveFavorite = (config) => ({
    type: types.FAVORITE_SAVE,
    config,
});

export const setSaveFavoriteResponse = (response) => ({
    type: types.FAVORITE_SAVE_RESPONSE_SET,
    response,
});

export const clearSaveFavoriteResponse = () => ({
    type: types.FAVORITE_SAVE_RESPONSE_CLEAR,
});

/*
export const saveFavoriteSuccess = () => ({
    type: types.FAVORITE_SAVE_SUCCESS,
});

export const saveFavoriteError = () => ({
    type: types.FAVORITE_SAVE_ERROR,
});
*/

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
