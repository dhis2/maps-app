import { combineEpics } from 'redux-observable'
import 'rxjs/add/operator/concatMap'
import { setTrackedEntityTypes } from '../actions/trackedEntities.js'
import * as types from '../constants/actionTypes.js'
import { apiFetch } from '../util/api.js'

// Load tracked entity types
export const loadTrackedEntityTypes = (action$) =>
    action$
        .ofType(types.TRACKED_ENTITY_TYPES_LOAD)
        .concatMap(() =>
            apiFetch(
                '/trackedEntityTypes?fields=id,displayName~rename(name)'
            ).then((data) => setTrackedEntityTypes(data.trackedEntityTypes))
        )

export default combineEpics(loadTrackedEntityTypes)
