import isNil from 'lodash/fp/isNil';
import omitBy from 'lodash/fp/omitBy';
import pick from 'lodash/fp/pick';
import { generateUid } from 'd2/lib/uid';
import { createAlert } from '../util/alerts';

// TODO: get latitude, longitude, zoom from map + basemap: 'none'
const validMapProperties = [
    'basemap',
    'id',
    'latitude',
    'longitude',
    'mapViews',
    'name',
    'description',
    'user',
    'zoom',
];

const validLayerProperties = [
    'aggregationType',
    'areaRadius',
    'classes',
    'colorHigh', // Deprecated
    'colorLow', // Deprecated
    'colorScale',
    'columns',
    'config',
    'datasetId',
    'displayName',
    'endDate',
    'eventClustering',
    'eventPointColor',
    'eventPointRadius',
    'filter',
    'filters',
    'id',
    'labels',
    'labelFontSize',
    'labelFontStyle',
    'labelFontWeight',
    'labelFontColor',
    'layer',
    'legendSet',
    'method',
    'opacity',
    'organisationUnitGroupSet',
    'params',
    'program',
    'programStage',
    'radiusHigh',
    'radiusLow',
    'rows',
    'serverCluster',
    'startDate',
    'valueType',
];

// TODO:
//  "hidden": false,
//  "userOrganisationUnit": false,
//  "userOrganisationUnitChildren": false,
//  "userOrganisationUnitGrandChildren": false,
//  "parentGraphMap": null,

const models = [
    // TODO: Better way to translate models to pure object?
    'program',
    'programStage',
    'organisationUnitGroupSet',
];

const validModelProperties = [
    'id',
    'name',
    'dimensionType',
    'dimensionItemType',
];

// TODO: Set hidden attribute
export const cleanMapConfig = config => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    basemap: getBasemapString(config.basemap),
    mapViews: config.mapViews.map(cleanLayerConfig),
});

const getBasemapString = basemap => {
    if (!basemap) {
        return 'osmLight';
    }

    if (basemap.isVisible === false) {
        return 'none';
    }

    return basemap.id;
};

const cleanLayerConfig = config => ({
    ...models2objects(pick(validLayerProperties, config)),
});

// TODO: This feels hacky, find better way to clean map configs before saving
const models2objects = config => {
    Object.keys(config).forEach(key => {
        config[key] = models.includes(key)
            ? pick(validModelProperties, config[key])
            : config[key];
    });

    if (config.rows) {
        config.rows = config.rows.map(cleanDimension);
    }

    if (config.params) {
        // EE layer config
        config.config = JSON.stringify({
            id: config.datasetId,
            params: config.params,
            image: config.filter ? config.filter[0].arguments[1] : null,
            filter: config.filter,
        });
        delete config.datasetId;
        delete config.params;
        delete config.filter;
    }

    return config;
};

const cleanDimension = dim => ({
    ...dim,
    items: dim.items.map(item => pick(validModelProperties, item)),
});

// Translate from chart/pivot config to map config
export const translateConfig = config => {
    if (!config.mapViews) {
        // TODO: Best way to detect chart/pivot config
        const { el, name } = config;
        const dimensions = [
            ...(config.columns || []),
            ...(config.rows || []),
            ...(config.filters || []),
        ];
        const columns = [dimensions.find(dim => dim.dimension === 'dx')]; // Data item
        const rows = [dimensions.find(dim => dim.dimension === 'ou')]; // Org units
        const filters = [dimensions.find(dim => dim.dimension === 'pe')]; // Period

        if (!columns.length || !rows.length || !filters.length) {
            return {
                el,
                name,
                alerts: [ createAlert(name, i18next.t('Map could not be created')) ],
            };
        }

        return {
            el,
            name,
            mapViews: [
                {
                    layer: 'thematic',
                    id: generateUid(),
                    name,
                    columns,
                    rows,
                    filters,
                },
            ],
        };
    }

    return config;
};
