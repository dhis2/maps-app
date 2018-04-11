import { combineEpics } from 'redux-observable';
import i18next from 'i18next';
import * as types from '../constants/actionTypes';
import { setMessage } from '../actions/message';
import { apiFetch } from '../util/api';
import { cleanMapConfig } from '../util/favorites';
import pick from 'lodash/fp/pick';

// Save existing favorite
export const saveFavorite = (action$, store) =>
    action$.ofType(types.FAVORITE_SAVE).concatMap(({ fields }) => {
        const mapConfig = cleanMapConfig(store.getState().map);
        const config = fields ? pick(fields, mapConfig) : mapConfig;

        if (config.mapViews) {
            config.mapViews.forEach(view => delete view.id);
        }

        return apiFetch(`/maps/${mapConfig.id}`, 'PUT', config).then(() =>
            setMessage(
                `${i18next.t('Favorite')} "${mapConfig.name}" ${i18next.t(
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

export default combineEpics(
    saveFavorite,
    saveNewFavorite,
);
