import * as types from '../constants/actionTypes';

export const updateFavorite = id => ({
    type: types.FAVORITE_UPDATE,
    id,
});
