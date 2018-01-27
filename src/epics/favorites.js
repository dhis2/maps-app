import { combineEpics } from 'redux-observable';
import * as types from '../constants/actionTypes';

export const saveFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_SAVE)
        .concatMap((action) => {
            const config = { ...store.getState().map };
            console.log('save favorite epic', action.name, config);
        }
    );

export default combineEpics(saveFavorite);