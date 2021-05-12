import * as types from '../constants/actionTypes';

export const loadFavorite = id => ({
    type: types.FAVORITE_LOAD,
    id,
});

export const updateFavorite = id => ({
    type: types.FAVORITE_UPDATE,
    id,
});

export const saveFavorite = () => ({
    type: types.FAVORITE_SAVE,
});

export const saveNewFavorite = config => ({
    type: types.FAVORITE_SAVE_NEW,
    payload: config,
});
