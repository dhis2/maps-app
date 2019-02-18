import { combineEpics } from 'redux-observable';
import { getInstance as getD2 } from 'd2';
import * as types from '../constants/actionTypes';
import { loadLayer } from '../actions/layers';

export const NAMESPACE = 'analytics';
export const CURRENT_AO_KEY = 'currentAnalyticalObject';

// Convert analytical object to thematic layer
const toThematicLayer = ao => {
    // TODO: Check if rows and filters should be switched

    // console.log('ao', ao);

    return {
        ...ao,
        layer: 'thematic',
        // filters: [ao.rows[0]],
        // rows: ao.filters,
    };
};

// Load analytical object from user store
export const getAnalyticalObject = action$ =>
    action$.ofType(types.ANALYTICAL_OBJECT_GET).concatMap(() =>
        getD2()
            .then(d2 => d2.currentUser.dataStore.get(NAMESPACE))
            .then(userDataStore => userDataStore.get(CURRENT_AO_KEY))
            .then(ao => loadLayer(toThematicLayer(ao)))
    );

export default combineEpics(getAnalyticalObject);
