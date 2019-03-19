import { combineEpics } from 'redux-observable';
import * as types from '../constants/actionTypes';
import { loadLayer } from '../actions/layers';
import { setAnalyticalObject } from '../actions/analyticalObject';
import { errorActionCreator } from '../actions/helpers';
import {
    getCurrentAnalyticalObject,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
    clearAnalyticalObjectFromUrl,
} from '../util/analyticalObject';

// Load analytical object from user data store
export const getAnalyticalObject = action$ =>
    action$.ofType(types.ANALYTICAL_OBJECT_GET).concatMap(() =>
        getCurrentAnalyticalObject()
            .then(ao => {
                clearAnalyticalObjectFromUrl();
                return hasSingleDataDimension(ao)
                    ? getThematicLayerFromAnalyticalObject(ao).then(loadLayer)
                    : setAnalyticalObject(ao);
            })
            .catch(
                e => errorActionCreator(types.ANALYTICAL_OBJECT_FAILURE)(e) // TODO: Show error
            )
    );

export default combineEpics(getAnalyticalObject);
