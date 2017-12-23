import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { addLayer, updateLayer } from '../actions/layers';
import { fetchLayer } from '../loaders/layers';
import { errorActionCreator } from '../actions/helpers';

const isNewLayer = (config) => config.id === undefined;

// Load one layer
export const loadLayer = (action$) =>
    action$
        .ofType(types.LAYER_LOAD)
        .concatMap((action) =>
            fetchLayer(action.payload)
                .then(config => isNewLayer(config) ? addLayer(config) : updateLayer(config))
                .catch(errorActionCreator(types.MAP_LOAD_ERROR))
        );

export default combineEpics(loadLayer);
