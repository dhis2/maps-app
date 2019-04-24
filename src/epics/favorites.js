import { combineEpics } from 'redux-observable';
import i18n from '@dhis2/d2-i18n';
import * as types from '../constants/actionTypes';
import { setMapProps } from '../actions/map';
import { setMessage } from '../actions/message';
import { apiFetch } from '../util/api';
import { cleanMapConfig } from '../util/favorites';

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
            setMessage(
                `${i18n.t('Favorite')} "${config.name}" ${i18n.t('is saved')}.`
            )
        );
    });

// Save new favorite
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
        .mergeMap(({ id, name, description, message }) =>
            name
                ? [
                      setMapProps({ id, name, description }),
                      setMessage(
                          `${i18n.t('Favorite')} "${name}" ${i18n.t(
                              'is saved'
                          )}.`
                      ),
                  ]
                : [setMessage(`${i18n.t('Error')}: ${message}`)]
        );

export default combineEpics(saveFavorite, saveNewFavorite);
