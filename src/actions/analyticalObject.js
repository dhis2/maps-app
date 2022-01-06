import log from 'loglevel';
import { loadLayer } from './layers';
import * as types from '../constants/actionTypes';
import {
    getCurrentAnalyticalObject,
    clearAnalyticalObjectFromUrl,
    hasSingleDataDimension,
    getThematicLayerFromAnalyticalObject,
} from '../util/analyticalObject';

export const setAnalyticalObject = ao => ({
    type: types.ANALYTICAL_OBJECT_SET,
    payload: ao,
});

export const clearAnalyticalObject = () => ({
    type: types.ANALYTICAL_OBJECT_CLEAR,
});

export const tSetAnalyticalObject = () => async dispatch => {
    try {
        getCurrentAnalyticalObject().then(ao => {
            clearAnalyticalObjectFromUrl();
            return hasSingleDataDimension(ao)
                ? getThematicLayerFromAnalyticalObject(ao).then(layer =>
                      dispatch(loadLayer(layer))
                  )
                : dispatch(setAnalyticalObject(ao));
        });
    } catch (e) {
        log.error('Could not load current analytical object');
        return e;
    }
};
