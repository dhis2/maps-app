import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { apiFetch } from '../util/api';
import { setDimensions, setDimensionItems } from '../actions/dimensions';
import { errorActionCreator } from '../actions/helpers';
import { getDisplayPropertyUrl } from '../util/helpers';

// Include the following dimension types
const dimensionTypes = [
    'CATEGORY',
    'CATEGORY_OPTION_GROUP_SET',
    'ORGANISATION_UNIT_GROUP_SET',
];

// Load dimensions of above types
export const loadDimensions = action$ =>
    action$.ofType(types.DIMENSIONS_LOAD).concatMap(() =>
        apiFetch(
            `/dimensions?fields=id,${getDisplayPropertyUrl()},dimensionType&filter=dimensionType:in:[${dimensionTypes.join(
                ','
            )}]&order=displayName:asc&paging=false`
        )
            .then(data => setDimensions(data.dimensions))
            .catch(errorActionCreator(types.DIMENSIONS_LOAD_ERROR))
    );

// Load items for one dimension
export const loadDimensionItems = action$ =>
    action$.ofType(types.DIMENSION_ITEMS_LOAD).concatMap(action =>
        apiFetch(
            `/dimensions/${
                action.dimensionId
            }/items?fields=id,${getDisplayPropertyUrl()}&order=displayName:asc&paging=false`
        )
            .then(data => setDimensionItems(action.dimensionId, data.items))
            .catch(errorActionCreator(types.DIMENSION_ITEMS_LOAD_ERROR))
    );

export default combineEpics(loadDimensions, loadDimensionItems);
