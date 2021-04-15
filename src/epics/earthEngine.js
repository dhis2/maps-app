import i18n from '@dhis2/d2-i18n';
import { combineEpics } from 'redux-observable';
import 'rxjs/add/operator/concatMap';
import * as types from '../constants/actionTypes';
import { loadEarthEngineApi } from '../components/map/MapApi';
import { apiFetch } from '../util/api';
import { createAlert } from '../util/alerts';
import { getYear, formatStartEndDate } from '../util/time';
import { setEarthEngineCollection } from '../actions/earthEngine';
import { errorActionCreator } from '../actions/helpers';
import { setAlert } from '../actions/alerts';

const collections = {
    'WorldPop/POP': resolve => {
        // Population density
        const imageCollection = ee
            .ImageCollection('WorldPop/POP')
            .filterMetadata('UNadj', 'equals', 'yes')
            .distinct('year')
            .sort('year', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['year'], null, false);

        featureCollection.getInfo(data => {
            resolve(
                data.features.map(feature => ({
                    id: feature.properties['year'],
                    name: String(feature.properties['year']), // TODO: Support numbers in d2-ui cmp
                }))
            );
        });
    },
    'NOAA/DMSP-OLS/NIGHTTIME_LIGHTS': resolve => {
        // Nighttime lights
        const imageCollection = ee
            .ImageCollection('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS')
            .distinct('system:time_start') // TODO: Why two images for some years?
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(feature => ({
                    id: feature.id,
                    name: String(
                        getYear(feature.properties['system:time_start'])
                    ),
                }))
            )
        );
    },
    'UCSB-CHG/CHIRPS/PENTAD': resolve => {
        // Precipitation
        const imageCollection = ee
            .ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
            .filterDate('2000-01-01', '2025-01-01')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(f => ({
                    id: f.id,
                    year: new Date(
                        f.properties['system:time_start']
                    ).getFullYear(),
                    name: formatStartEndDate(
                        f.properties['system:time_start'],
                        f.properties['system:time_end'] - 7200001, // Minus 2 hrs to end the day before
                        null,
                        false
                    ),
                }))
            )
        );
    },
    'MODIS/006/MOD11A2': resolve => {
        // Temperature
        const imageCollection = ee
            .ImageCollection('MODIS/006/MOD11A2')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(f => ({
                    id: f.id,
                    year: new Date(
                        f.properties['system:time_start']
                    ).getFullYear(),
                    name: formatStartEndDate(
                        f.properties['system:time_start'],
                        f.properties['system:time_end'] - 7200001, // Minus 2 hrs to end the day before
                        null,
                        false
                    ),
                }))
            )
        );
    },
    'MODIS/006/MCD12Q1': resolve => {
        // Landcover
        const imageCollection = ee
            .ImageCollection('MODIS/006/MCD12Q1')
            .sort('system:time_start', false);

        const featureCollection = ee
            .FeatureCollection(imageCollection)
            .select(['system:time_start', 'system:time_end'], null, false);

        featureCollection.getInfo(data =>
            resolve(
                data.features.map(feature => ({
                    id: feature.id,
                    name: String(
                        getYear(feature.properties['system:time_start'])
                    ),
                }))
            )
        );
    },
};

const setAuthToken = async ({ client_id, access_token, expires_in }) =>
    new Promise((resolve, reject) => {
        ee.data.setAuthToken(client_id, 'Bearer', access_token, expires_in);
        ee.initialize(null, null, resolve, reject);
    });

// Load collection (periods) for one EE dataset
export const loadCollection = action$ =>
    action$
        .ofType(types.EARTH_ENGINE_COLLECTION_LOAD)
        .concatMap(async action => {
            const token = await apiFetch('/tokens/google').catch(
                errorActionCreator(types.EARTH_ENGINE_COLLECTION_LOAD_ERROR)
            );

            if (token && token.status === 'ERROR') {
                return setAlert(
                    createAlert(
                        i18n.t(token.message),
                        i18n.t(
                            'To show this layer you must first sign up for the Earth Engine service at Google. Please check the DHIS 2 documentation.'
                        )
                    )
                );
            }

            if (!window.ee && loadEarthEngineApi) {
                await loadEarthEngineApi();
            }

            try {
                await setAuthToken(token);
            } catch (e) {
                return setAlert(
                    createAlert(
                        i18n.t('Error'),
                        i18n.t(
                            'A connection to Google Earth Engine could not be established.'
                        )
                    )
                );
            }
            return new Promise(collections[action.id]).then(data =>
                setEarthEngineCollection(action.id, data)
            );
        });

export default combineEpics(loadCollection);
