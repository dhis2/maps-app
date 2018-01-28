import { combineEpics } from 'redux-observable';
import * as types from '../constants/actionTypes';
import { setSaveFavoriteResponse } from '../actions/favorites';
import { apiFetch } from '../util/api';

export const saveFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_SAVE)
        .concatMap(({ config }) =>
            apiFetch('/maps/', 'POST', config)
                .then(setSaveFavoriteResponse)
        );

export default combineEpics(saveFavorite);
