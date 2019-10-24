import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2/lib/d2';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { setTrackedEntityTypes } from '../actions/trackedEntities';
import { errorActionCreator } from '../actions/helpers';
import { apiFetch } from '../util/api';

// Load tracked entity types
export const loadTrackedEntityTypes = action$ =>
    action$
        .ofType(types.TRACKED_ENTITY_TYPES_LOAD)
        .concatMap(() =>
            apiFetch(
                '/trackedEntityTypes.json?fields=id,displayName~rename(name)'
            ).then(data => setTrackedEntityTypes(data.trackedEntityTypes))
        );

export default combineEpics(loadTrackedEntityTypes);
