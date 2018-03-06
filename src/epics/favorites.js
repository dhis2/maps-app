import { combineEpics } from 'redux-observable';
import i18next from 'i18next';
import * as types from '../constants/actionTypes';
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

        return apiFetch(`/maps/${config.id}`, 'PUT', config).then(() =>
            setMessage(
                `${i18next.t('Favorite')} "${config.name}" ${i18next.t(
                    'is saved'
                )}.`
            )
        );
    });

// Save new favorite
export const saveNewFavorite = action$ =>
    action$
        .ofType(types.FAVORITE_SAVE_NEW)
        .concatMap(({ config }) =>
            apiFetch('/maps/', 'POST', config).then(
                response =>
                    response.status === 'OK'
                        ? setMessage(
                              `${i18next.t('Favorite')} "${
                                  config.name
                              }" ${i18next.t('is saved')}.`
                          )
                        : setMessage(
                              `${i18next.t('Error')}: ${response.message}`
                          )
            )
        );

// Save new favorite interpretation
export const saveFavoriteInterpretation = action$ =>
    action$
        .ofType(types.FAVORITE_INTERPRETATION_SAVE)
        .concatMap(({ id, interpretation }) =>
            apiFetch(`/interpretations/map/${id}`, 'POST', interpretation).then(
                response => setMessage(i18next.t(response.message))
            )
        );

export default combineEpics(
    saveFavorite,
    saveNewFavorite,
    saveFavoriteInterpretation
);
