import i18n from '@dhis2/d2-i18n';
import { formatStartEndDate } from './time';
import { loadEarthEngineWorker } from '../components/map/MapApi';
import { apiFetch } from './api';
import { getEarthEngineLayer } from '../constants/earthEngine';

let eeWorker;

export const classAggregation = ['percentage', 'hectares', 'acres'];

export const hasClasses = type => classAggregation.includes(type);

export const getStartEndDate = data =>
    formatStartEndDate(
        data['system:time_start'],
        data['system:time_end'], // - 7200001, // Minus 2 hrs to end the day before
        null,
        false
    );

export const getPeriodFromFilter = filter => {
    if (!Array.isArray(filter) || !filter.length) {
        return null;
    }

    const { id, name, year, arguments: args } = filter[0];

    return {
        id: id || args[1],
        name,
        year,
    };
};

// Returns period name from filter
export const getPeriodNameFromFilter = filter => {
    const period = getPeriodFromFilter(filter);

    if (!period) {
        return null;
    }

    const { name, year } = period;
    const showYear = year && String(year) !== name;

    return `${name}${showYear ? ` ${year}` : ''}`;
};

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

        if (!eeWorker) {
            const EarthEngineWorker = loadEarthEngineWorker();
            eeWorker = await new EarthEngineWorker();
        }

        await eeWorker.initialize(token);

        resolve();
    });

export const getPeriods = async eeId => {
    const { periodType } = getEarthEngineLayer(eeId);

    const getPeriod = ({ id, properties }) => {
        const year = new Date(properties['system:time_start']).getFullYear();
        const name =
            periodType === 'Yearly'
                ? String(year)
                : getStartEndDate(properties);

        // Remove when old population should not be supported
        if (eeId === 'WorldPop/POP') {
            return { id: name, name, year };
        }

        return { id, name, year };
    };

    await connectEarthEngine();

    const { features } = await eeWorker.getPeriods(eeId);

    return features.map(getPeriod);
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

// Add readable prop names before downloading EE data
// Classed data (landcover) will use the class names
// Other layers will include layer name after aggregation type
export const addPropNames = (layer, data) => {
    const { aggregationType, name, legend } = layer;
    const layerName = name.replace(/ /g, '_').toLowerCase();
    const { items } = legend;

    return hasClasses(aggregationType)
        ? items.reduce(
              (obj, { id, name }) => ({
                  ...obj,
                  [name]: data[id],
              }),
              {}
          )
        : Object.keys(data).reduce(
              (obj, id) => ({
                  ...obj,
                  [`${id}_${layerName}`]: data[id],
              }),
              {}
          );
};
