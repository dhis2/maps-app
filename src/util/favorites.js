import isNil from 'lodash/fp/isNil';
import omitBy from 'lodash/fp/omitBy';
import pick from 'lodash/fp/pick';
import { generateUid } from 'd2/lib/uid';

// TODO: get latitude, longitude, zoom from map + basemap: 'none'
const validMapProperties = [
    'basemap',
    'id',
    'latitude',
    'longitude',
    'mapViews',
    'name',
    // 'user', // ?
    'zoom',
];

const validLayerProperties = [
    'aggregationType',
    'areaRadius',
    'classes',
    'colorHigh', // Deprecated
    'colorLow',  // Deprecated
    'colorScale',
    'columns',
    'config',   // TODO: Convert to string (ee + external)
    'displayName',
    'endDate',
    'eventClustering',
    'eventPointColor',
    'eventPointRadius',
    'filters',
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

const models = [ // TODO: Better way to translate models to pure object?
    'program',
    'programStage',
];

const validModelProperties = [
    'id',
    'name',
    'dimensionType',
    'dimensionItemType',
];

// TODO: Set hidden attribute
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
        config.rows = config.rows.map(cleanDimension);
    }

    return config;
};

const cleanDimension = (dim) => ({
    ...dim,
    items: dim.items.map(item => pick(validModelProperties, item)),
});

// Translate from chart/pivot config to map config
export const translateConfig = (config) => {
    if (!config.mapViews) { // TODO: Best way to detect chart/pivot config
        const {el, name } = config;
        const dimensions = [
          ...config.columns || [],
          ...config.rows || [],
          ...config.filters || [],
        ];
        const columns = [dimensions.find(dim => dim.dimension === 'dx')]; // Data item
        const rows = [dimensions.find(dim => dim.dimension === 'ou')]; // Org units
        const filters = [dimensions.find(dim => dim.dimension === 'pe')]; // Period

        if (!columns.length || !rows.length || !filters.length) {
            return {
                el,
                name,
                alerts: [{
                    title: name,
                    description: i18next.t('Map could not be created'),
                }]
            }
        }

        return {
            el,
            name,
            mapViews: [{
                layer: 'thematic',
                id: generateUid(),
                name,
                columns,
                rows,
                filters,
            }]
        }
    }

    return config;
};
