import { combineEpics } from 'redux-observable';
import i18next from 'i18next';
import * as types from '../constants/actionTypes';
import { setSaveNewFavoriteResponse } from '../actions/favorites';
import { setMessage } from '../actions/message';
import { apiFetch } from '../util/api';
import { cleanMapConfig } from '../util/favorites';

// Save existing favorite
export const saveFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_SAVE)
        .concatMap(() => {
            const config = cleanMapConfig(store.getState().map);

            if (config.mapViews) {
                config.mapViews.forEach(view => delete view.id);
            }

            return apiFetch(`/maps/${config.id}`, 'PUT', config)
                .then(() => setMessage(`${i18next.t('Favorite')} "${config.name}" ${i18next.t('is saved')}.`));
        });

// Save new favorite
export const saveNewFavorite = (action$) =>
    action$
        .ofType(types.FAVORITE_SAVE_NEW)
        .concatMap(({ config }) =>
            apiFetch('/maps/', 'POST', config)
                .then(setSaveNewFavoriteResponse)
        );

// Save new favorite interpretation
export const saveFavoriteInterpretation = (action$) =>
    action$
        .ofType(types.FAVORITE_INTERPRETATION_SAVE)
        .concatMap(({ id, interpretation }) =>
            console.log('save', id, interpretation)
        );

export default combineEpics(saveFavorite, saveNewFavorite, saveFavoriteInterpretation);



/*
Ext.Ajax.request({
    url: encodeURI(gis.init.apiPath + 'interpretations/map/' + gis.map.id),
    method: 'POST',
    params: textArea.getValue(),
    headers: {'Content-Type': 'text/html'},
    success: function() {
        textArea.reset();
        window.hide();
    }
});
*/