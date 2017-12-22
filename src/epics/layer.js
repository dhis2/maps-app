import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { errorActionCreator } from '../actions/helpers';
import { mapRequest } from '../util/requests';
import { setMap } from '../actions/map';

// Load one favorite
export const loadLayer = (action$) =>
  action$
    .ofType(types.MAP_LOAD)
    .concatMap((action) =>
      mapRequest(action.id)
        .then(config => setMap(config))
        .catch(errorActionCreator(types.MAP_LOAD_ERROR))
    );

export default combineEpics(loadMap);
