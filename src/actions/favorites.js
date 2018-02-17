import * as types from '../constants/actionTypes';

// Load one map favorite
export const loadFavorite = (id) => ({
    type: types.FAVORITE_LOAD,
    id,
});

// Save existing favorite
export const saveFavorite = () => ({
  type: types.FAVORITE_SAVE,
});

export const saveNewFavorite = (config) => ({
    type: types.FAVORITE_SAVE_NEW,
    config,
});

export const setSaveNewFavoriteResponse = (response) => ({
    type: types.FAVORITE_SAVE_NEW_RESPONSE_SET,
    response,
});

export const clearSaveNewFavoriteResponse = () => ({
    type: types.FAVORITE_SAVE_NEW_RESPONSE_CLEAR,
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

export const openSaveNewFavoriteDialog = () => ({
    type: types.FAVORITE_SAVE_NEW_DIALOG_OPEN,
});

export const closeSaveNewFavoriteDialog = () => ({
    type: types.FAVORITE_SAVE_NEW_DIALOG_CLOSE,
});
