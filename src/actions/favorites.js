import * as types from '../constants/actionTypes';
import store from '../store';
import pickBy from 'lodash/fp/pickBy';

const toActionRoute = (id, interpretationId) => {
    const query = {id, interpretationid: interpretationId};
    const cleanQuery = pickBy(val => val, query);
    return {meta: {query: cleanQuery}};
}

export const loadFavorite = (id, interpretationId) => ({
    type: types.FAVORITE_LOAD,
    ...toActionRoute(id, interpretationId),
});

export const setCurrentInterpretation = interpretationId => ({
    type: types.FAVORITE_LOAD,
    ...toActionRoute(store.getState().map.id, interpretationId),
});

export const saveFavorite = (fields) => ({
    type: types.FAVORITE_SAVE,
    fields,
});

export const saveNewFavorite = config => ({
    type: types.FAVORITE_SAVE_NEW,
    config,
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
