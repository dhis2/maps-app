import * as types from '../constants/actionTypes';

export const loadFavorite = id => ({
    type: types.FAVORITE_LOAD,
    id,
});

export const saveFavorite = () => ({
    type: types.FAVORITE_SAVE,
});

export const saveNewFavorite = config => ({
    type: types.FAVORITE_SAVE_NEW,
    config,
});

export const saveFavoriteInterpretation = (id, interpretation) => ({
    type: types.FAVORITE_INTERPRETATION_SAVE,
    id,
    interpretation,
});

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
