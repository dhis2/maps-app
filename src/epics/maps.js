import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { mapRequest } from '../util/requests';
import { setMap } from '../actions/map';
import { loadLayer } from '../actions/layers';
import { openLayersPanel, closeLayersPanel, openRightPanel, closeRightPanel } from '../actions/ui';
import { setInterpretations, setCurrentInterpretation, openInterpretationDialog } from '../actions/interpretations';
import { newMap } from '../actions/map';

const getInterpretationActions = (favoriteChanged, interpretationId) => {
    const panelActionFunctions = interpretationId
        ? [closeLayersPanel, openRightPanel]
        : [openLayersPanel, closeRightPanel];
    const panelActions = favoriteChanged ? panelActionFunctions.map(f => f()) : [];
    const setInterpretationAction = (interpretationId === "new")
        ? openInterpretationDialog({})
        : setCurrentInterpretation(interpretationId);

    return [...panelActions, setInterpretationAction];
};

// Load one favorite
export const loadFavorite = (action$, store) =>
    action$
        .ofType(types.FAVORITE_LOAD)
        .concatMap(action => {
            const currentId = store.getState().map.id;
            const {id, interpretationid: interpretationId} = action.meta.query || {};
            const favoriteChanged = (id !== currentId);

            if (!id) {
                return Observable.of(newMap());
            } else if (!favoriteChanged) {
                return Observable.of(...getInterpretationActions(favoriteChanged, interpretationId));
            } else {
                return Observable.fromPromise(
                    mapRequest(id).catch(errorActionCreator(types.FAVORITE_LOAD_ERROR))
                ).mergeMap(config => [
                    setMap(config),
                    ...config.mapViews.map(loadLayer),
                    setInterpretations(config.interpretations),
                    ...getInterpretationActions(favoriteChanged, interpretationId),
                ]);
            }
        })

export default combineEpics(loadFavorite);
