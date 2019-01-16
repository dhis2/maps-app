import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { apiFetch } from '../util/api';
import { setDimensions, setDimensionItems } from '../actions/dimensions';
import { errorActionCreator } from '../actions/helpers';
// import { getDisplayPropertyUrl } from '../util/helpers';

// https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/api/dimensions.js#L28-L35
// TODO: Fix getDisplayPropertyUrl
export const loadDimensions = action$ =>
    action$.ofType(types.DIMENSIONS_LOAD).concatMap(() =>
        apiFetch(
            '/dimensions?fields=id,displayName~rename(name),dimensionType&filter=dimensionType:in:[CATEGORY,CATEGORY_OPTION_GROUP_SET,ORGANISATION_UNIT_GROUP_SET]&order=displayName:asc&paging=false'
        )
            .then(data => setDimensions(data.dimensions))
            .catch(errorActionCreator(types.DIMENSIONS_LOAD_ERROR))
    );

// https://play.dhis2.org/dev/api/31/dimensions/uIuxlbV1vRT/items?fields=id,displayName~rename(name)&order=displayName:asc
export const loadDimensionItems = action$ =>
    action$.ofType(types.DIMENSION_ITEMS_LOAD).concatMap(action =>
        apiFetch(
            `/dimensions/${
                action.dimensionId
            }/items?fields=id,displayName~rename(name)&order=displayName:asc&paging=false`
        )
            .then(data => setDimensionItems(data.items))
            .catch(errorActionCreator(types.DIMENSION_ITEMS_LOAD_ERROR))
    );

export default combineEpics(loadDimensions, loadDimensionItems);
