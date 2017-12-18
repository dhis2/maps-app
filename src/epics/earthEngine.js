import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import { timeFormat } from 'd3-time-format';
import * as types from '../constants/actionTypes';
import { apiFetch } from '../util/api';
import { setEarthEngineCollection } from '../actions/earthEngine';
import { errorActionCreator } from '../actions/helpers';

const collections = {
    'WorldPop/POP': (resolve, reject) => { // Population density
        const imageCollection = ee.ImageCollection('WorldPop/POP')
            .filterMetadata('UNadj', 'equals', 'yes')
            .distinct('year')
            .sort('year', false);

        const featureCollection = ee.FeatureCollection(imageCollection)
            .select(['year'], null, false);

        featureCollection.getInfo(data => resolve(data.features.map(feature => ({
            id: feature.properties['year'],
            name: String(feature.properties['year']), // TODO: Support numbers in d2-ui cmp
        }))));
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': (resolve, reject) => { // Nighttime lights
        const imageCollection = ee.ImageCollection('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS')
            .distinct('system:time_start') // TODO: Why two images for some years?
            .sort('system:time_start', false);

        const featureCollection = ee.FeatureCollection(imageCollection)
            .select(['system:time_start'], null, false);

        featureCollection.getInfo(data => resolve(data.features.map(feature => ({
            id: feature.id,
            name: String(new Date(feature.properties['system:time_start']).getFullYear()), // TODO: Support numbers in d2-ui cmp
        }))));
    },
    'UCSB-CHG/CHIRPS/PENTAD': (resolve, reject) => { // Precipitation
        const imageCollection = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
            .filterDate('2000-01-01', '2025-01-01')
            .sort('system:time_start', false);

        const featureCollection = ee.FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data => resolve(data.features.map(feature => ({
            id: feature.id,
            name: timeFormat('%-d – ')(feature.properties['system:time_start']) + timeFormat('%-d %b %Y')(feature.properties['system:time_end'] - 7200001), // Minus 2 hrs to end the day before
        }))));
    },
    'MODIS/MOD11A2': (resolve, reject) => { // Temperature
        const imageCollection = ee.ImageCollection('MODIS/MOD11A2')
            .sort('system:time_start', false);

        const featureCollection = ee.FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data => resolve(data.features.map(feature => ({
            id: feature.id,
            name: timeFormat('%-d %b – ')(feature.properties['system:time_start']) + timeFormat('%-d %b %Y')(feature.properties['system:time_end'] - 7200001), // Minus 2 hrs to end the day before
          }))));
    },
    'MODIS/051/MCD12Q1': (resolve, reject) => { // Landcover
        const imageCollection = ee.ImageCollection('MODIS/051/MCD12Q1')
            .sort('system:time_start', false);

        const featureCollection = ee.FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data => resolve(data.features.map(feature => ({
            id: feature.id,
            name: String(new Date(feature.properties['system:time_start']).getFullYear()), // TODO: Support numbers in d2-ui cmp
        }))));
    },
};

const setAuthToken = ({ client_id, access_token, expires_in }) => {
    ee.data.setAuthToken(client_id, 'Bearer', access_token, expires_in, null, null, false);
    ee.initialize();
};

// Load collection (periods) for one EE dataset
export const loadCollection = (action$) =>
    action$
        .ofType(types.EARTH_ENGINE_COLLECTION_LOAD)
        .concatMap((action) => apiFetch('/tokens/google')
            .then(setAuthToken)
            .then(() => new Promise(collections[action.id]))
            .then((data) => setEarthEngineCollection(action.id, data))
            .catch(errorActionCreator(types.EARTH_ENGINE_COLLECTION_LOAD_ERROR))
        );

export default combineEpics(loadCollection);
