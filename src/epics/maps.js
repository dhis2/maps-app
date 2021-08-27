import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/mergeMap';
import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { mapRequest } from '../util/requests';
import { cleanMapObject, addOrgUnitPaths } from '../util/helpers';
import { setMap, setMapProps } from '../actions/map';
import { loadLayer } from '../actions/layers';

// Load one favorite
export const loadFavorite = action$ =>
    action$
        .ofType(types.FAVORITE_LOAD)
        .concatMap(action =>
            mapRequest(action.id)
                .then(cleanMapObject)
                .catch(errorActionCreator(types.FAVORITE_LOAD_ERROR))
        )
        .mergeMap(config => [
            setMap(config),
            ...addOrgUnitPaths(config.mapViews).map(loadLayer),
        ]);

// Update favorite except layers on map save
export const updateFavorite = action$ =>
    action$
        .ofType(types.FAVORITE_UPDATE)
        .concatMap(action =>
            mapRequest(action.id).catch(
                errorActionCreator(types.FAVORITE_UPDATE_ERROR)
            )
        )
        .mergeMap(config => {
            delete config.mapViews;
            return [setMapProps(config)];
        });

export default combineEpics(loadFavorite, updateFavorite);
