import isNil from 'lodash/fp/isNil';
import omitBy from 'lodash/fp/omitBy';
import pick from 'lodash/fp/pick';

const validMapProperties = [
    'basemap',
    'id',
    'latitude',
    'longitude',
    'mapViews',
    'name',
    'user', // ?
    'zoom',
];

const validLayerProperties = [
    'columns',
    'displayName',
    'endDate',
    'eventClustering',
    'eventPointColor',
    'eventPointRadius',
    'filters',
    'layer',
    'opacity',
    'program',
    'programStage',
    'rows',
    'serverCluster',
    'startDate',
];

const models = [ // TODO: Better way to translate models to pure object?
    'program',
    'programStage',
];

const validModelProperties = [
    'id',
    'name',
];

export const cleanMapConfig = (config) => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    basemap: config.basemap ? config.basemap.id : 'osmLight',
    mapViews: config.mapViews.map(cleanLayerConfig),
});

const cleanLayerConfig = (config) => {
    return {
        ...models2objects(pick(validLayerProperties, config)),
    };
};

// TODO: This feels hacky, find better way to clean map configs before saving
const models2objects = (config) => {
    Object.keys(config).forEach(key => {
        config[key] = models.includes(key) ? pick(validModelProperties, config[key]) : config[key];
    });

    if (config.rows) {
        config.rows = config.rows.map(row => ({
            ...row,
            items: row.items.map(item => pick(validModelProperties, item)),
        }));
    }

    return config;
};
