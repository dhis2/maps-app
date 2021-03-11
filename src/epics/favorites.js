import { combineEpics } from 'redux-observable';
import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';
import { updateFavorite } from '../actions/favorites';
import { setAlert } from '../actions/alerts';
import { apiFetch } from '../util/api';
import { cleanMapConfig } from '../util/favorites';

const getSavedMessage = name => i18n.t('Map "{{name}}" is saved.', { name });

// Save existing favorite
export const saveFavorite = (action$, store) =>
    action$.ofType(types.FAVORITE_SAVE).concatMap(() => {
        const config = cleanMapConfig(store.getState().map);

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        // Avoid loosing latest translation and sharing settings
        return apiFetch(
            `/maps/${config.id}?skipTranslations=true&skipSharing=true`,
            'PUT',
            config
        ).then(() =>
            setAlert({
                success: true,
                message: getSavedMessage(config.name),
            })
        );
    });

// Save new map
export const saveNewFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_SAVE_NEW)
        .concatMap(({ payload }) => {
            const config = {
                ...cleanMapConfig(store.getState().map),
                name: payload.name,
                description: payload.description,
            };

            delete config.id;

            if (config.mapViews) {
                config.mapViews.forEach(view => delete view.id);
            }

            return apiFetch('/maps/', 'POST', config)
                .then(response => response.json())
                .then(response =>
                    response.status === 'OK'
                        ? {
                              ...config,
                              id: response.response.uid,
                          }
                        : response
                );
        })
        .mergeMap(({ id, name, message }) =>
            name
                ? [
                      updateFavorite(id),
                      setAlert({
                          success: true,
                          message: getSavedMessage(name),
                      }),
                  ]
                : [
                      setAlert({
                          critical: true,
                          message: `${i18n.t('Error')}: ${message}`,
                      }),
                  ]
        );

export default combineEpics(saveFavorite, saveNewFavorite);
