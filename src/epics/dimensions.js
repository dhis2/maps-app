import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { apiFetch } from '../util/api';
import { setDimensions } from '../actions/dimensions';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

// https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/api/dimensions.js#L28-L35
// TODO: Fix getDisplayPropertyUrl
export const loadDimensions = action$ =>
    action$.ofType(types.DIMENSIONS_LOAD).concatMap(() =>
        apiFetch(
            '/dimensions?fields=id,displayName~rename(name),dimensionType&order=displayName:asc'
        )
            .then(data => setDimensions(data.dimensions))
            .catch(errorActionCreator(types.DIMENSIONS_LOAD_ERROR))
    );

export default combineEpics(loadDimensions);
