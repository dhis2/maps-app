import * as types from '../constants/actionTypes';

export const loadFavorite = id => ({
    type: types.FAVORITE_LOAD,
    id,
});

export const updateFavorite = id => ({
    type: types.FAVORITE_UPDATE,
    id,
});
