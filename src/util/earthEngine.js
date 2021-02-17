import i18n from '@dhis2/d2-i18n';
import { formatStartEndDate } from './time';
import { loadEarthEngineApi } from '../components/map/MapApi';
import { apiFetch } from './api';
import { getEarthEngineLayer } from '../constants/earthEngine';

export const classAggregation = ['percentage', 'hectares', 'acres'];

export const hasClasses = type => classAggregation.includes(type);

export const getStartEndDate = data =>
    formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'], // - 7200001, // Minus 2 hrs to end the day before
        null,
        false
    );

export const getPeriodFromFilter = (filter = []) => {
    const f = filter[0];

    return f
        ? {
              id: f.id || f.arguments[1],
              name: f.name,
              year: f.year,
          }
        : null;
};
const setAuthToken = async ({ client_id, access_token, expires_in }) =>
    new Promise((resolve, reject) => {
        ee.data.setAuthToken(client_id, 'Bearer', access_token, expires_in);
        ee.initialize(null, null, resolve, reject);
    });

// Set token and load api
const connectEarthEngine = () =>
    new Promise(async (resolve, reject) => {
        const token = await apiFetch('/tokens/google').catch(() =>
            reject({
                type: 'engine',
                error: true,
                message: i18n.t(
                    'Cannot get authorization token for Google Earth Engine.'
                ),
            })
        );

        if (token && token.status === 'ERROR') {
            reject({
                type: 'engine',
                warning: true,
                message: i18n.t(
                    'This layer requires a Google Earth Engine account. Check the DHIS2 documentation for more information.'
                ),
            });
        }

        if (!window.ee && loadEarthEngineApi) {
            await loadEarthEngineApi();
        }

        try {
            await setAuthToken(token);
        } catch (e) {
            reject({
                type: 'engine',
                error: true,
                message: i18n.t('Cannot connect to Google Earth Engine.'),
            });
        }

        resolve(window.ee);
    });

const getInfoPromise = obj => new Promise(resolve => obj.getInfo(resolve));

export const getPeriods = async id => {
    const { periodType } = getEarthEngineLayer(id);
    const ee = await connectEarthEngine();

    const imageCollection = ee
        .ImageCollection(id)
        .distinct('system:time_start')
        .sort('system:time_start', false);

    const featureCollection = ee
        .FeatureCollection(imageCollection)
        .select(['system:time_start', 'system:time_end'], null, false);

    // Return first and last date for daily periods
    if (periodType === 'Daily') {
        const last = await getInfoPromise(featureCollection.first());
        const first = await getInfoPromise(
            featureCollection.sort('system:time_start', true).first()
        );

        return { startPeriod: first.id, endPeriod: last.id };
    }

    const getPeriod = ({ id, properties }) => {
        const year = new Date(properties['system:time_start']).getFullYear();
        const name =
            periodType === 'Yearly'
                ? String(year)
                : getStartEndDate(properties);

        return { id, name, year };
    };

    return new Promise(resolve =>
        featureCollection.getInfo(({ features }) =>
            resolve(features.map(getPeriod))
        )
    );
};

export const defaultFilters = ({ id, name, year }) => [
    {
        type: 'eq',
        arguments: ['system:index', String(id)],
        name,
        year,
    },
];

export const getPrecision = (values = []) => {
    if (values.length) {
        const sortedValues = [...values].sort((a, b) => a - b);
        const minValue = sortedValues[0];
        const maxValue = sortedValues[sortedValues.length - 1];
        const gapValue = maxValue - minValue;
        const absValue = Math.abs(maxValue);

        if (absValue >= 10000) {
            return 0;
        }

        if (absValue >= 1000) {
            return gapValue > 10 ? 0 : 1;
        }

        if (absValue >= 100) {
            return gapValue > 1 ? 1 : 2;
        }

        if (absValue >= 10) {
            return gapValue > 0.1 ? 2 : 3;
        }

        if (absValue >= 1) {
            return gapValue > 0.01 ? 3 : 4;
        }

        return gapValue > 0.001 ? 4 : 5;
    }

    return 0;
};

export const getPropName = (valueType = '', layerName = '') => {
    const firstWord = layerName.replace(/ .*/, '');
    return `${valueType}${firstWord}`;
};
