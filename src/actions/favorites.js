import * as types from '../constants/actionTypes';

export const saveFavorite = (name) => ({
    type: types.FAVORITE_SAVE,
    name,
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
