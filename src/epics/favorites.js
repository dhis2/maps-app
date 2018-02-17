import { combineEpics } from 'redux-observable';
import * as types from '../constants/actionTypes';
import { setSaveNewFavoriteResponse } from '../actions/favorites';
import { apiFetch } from '../util/api';
import { cleanMapConfig } from '../util/favorites';

// Save existing favorite
export const saveFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_SAVE)
        .concatMap(() => {
            const config = cleanMapConfig(store.getState().map);

            if (config.mapViews) {
                 config.mapViews = config.mapViews.map(layer => ({
                     ...layer,
                     // layer: layer.id,
                 }));

                 delete config.mapViews[0].id;
                 // delete config.mapViews[0].columns;
                 // delete config.mapViews[0].filters
            }

            // console.log('save config', config)

            return apiFetch(`/maps/${config.id}`, 'PUT', config)
                .then(() => console.log('Saved'));
        });

// Save new favorite
export const saveNewFavorite = (action$) =>
    action$
        .ofType(types.FAVORITE_SAVE_NEW)
        .concatMap(({ config }) =>
            apiFetch('/maps/', 'POST', config)
                .then(setSaveNewFavoriteResponse)
        );

export default combineEpics(saveFavorite, saveNewFavorite);
