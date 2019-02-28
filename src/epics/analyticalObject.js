import { combineEpics } from 'redux-observable';
import { config, getInstance as getD2 } from 'd2';
import * as types from '../constants/actionTypes';
import { loadLayer } from '../actions/layers';
import { setAnalyticalObject } from '../actions/analyticalObject';
import { errorActionCreator } from '../actions/helpers';
import {
    isValidAnalyticalObject,
    getDataDimensionsFromAnalyticalObject,
    getThematicLayerFromAnalyticalObject,
} from '../util/analytics';

const NAMESPACE = 'analytics';
const CURRENT_AO_KEY = 'currentAnalyticalObject';

const APP_URLS = {
    CHART: 'dhis-web-data-visualizer',
    PIVOT: 'dhis-web-pivot',
};

// Returns or creates "analytics" namespace in user data store
const getNamespace = async d2 => {
    const { dataStore } = d2.currentUser;
    const hasNamespace = await dataStore.has(NAMESPACE);

    return hasNamespace
        ? await dataStore.get(NAMESPACE)
        : await dataStore.create(NAMESPACE);
};

// Load analytical object from user data store
export const getAnalyticalObject = action$ =>
    action$.ofType(types.ANALYTICAL_OBJECT_GET).concatMap(() =>
        getD2()
            .then(getNamespace)
            .then(ns => ns.get(CURRENT_AO_KEY))
            .then(ao =>
                isValidAnalyticalObject(ao)
                    ? getThematicLayerFromAnalyticalObject(ao).then(loadLayer)
                    : setAnalyticalObject(ao)
            )
            .catch(
                e => errorActionCreator(types.ANALYTICAL_OBJECT_FAILURE)(e) // TODO: Show error
            )
    );

// Set analytical object to user data store
/*
export const setAnalyticalObject = (action$, store) =>
    action$.ofType(types.ANALYTICAL_OBJECT_SET).concatMap(action =>
        getD2()
            .then(getNamespace)
            .then(ns => {
                const { id, openAs } = action.payload;
                const app = APP_URLS[openAs];
                const state = store.getState();
                const layer = state.map.mapViews.find(l => l.id === id);

                ns.set(CURRENT_AO_KEY, toAnalyticalObject(layer));

                // TODO: Probably not the correct place to update the URL
                window.location.href = `${
                    config.appUrl
                }/${app}/#/currentAnalyticalObject`;
            })
    );
    */

// export default combineEpics(getAnalyticalObject, setAnalyticalObject);
export default combineEpics(getAnalyticalObject);
