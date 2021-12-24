import { isNil, omitBy, pick, isObject, omit } from 'lodash/fp';
import { EARTH_ENGINE_LAYER, TRACKED_ENTITY_LAYER } from '../constants/layers';
import { DEFAULT_BASEMAP_ID } from '../constants/basemaps';

// TODO: get latitude, longitude, zoom from map + basemap: 'none'
const validMapProperties = [
    'basemap',
    'id',
    'latitude',
    'longitude',
    'mapViews',
    'name',
    'user',
    'zoom',
    'publicAccess',
    'created',
    'lastUpdated',
];

const validLayerProperties = [
    'aggregationType',
    'areaRadius',
    'band',
    'classes',
    'colorHigh', // Deprecated
    'colorLow', // Deprecated
    'colorScale',
    'columns',
    'config',
    'created',
    'datasetId',
    'displayName',
    'endDate',
    'eventCoordinateField',
    'eventClustering',
    'eventPointColor',
    'eventPointRadius',
    'eventStatus',
    'filter',
    'filters',
    'followUp',
    'id',
    'labels',
    'labelFontSize',
    'labelFontStyle',
    'labelFontWeight',
    'labelFontColor',
    'lastUpdated',
    'layer',
    'legendSet',
    'method',
    'name',
    'noDataColor',
    'opacity',
    'organisationUnitColor',
    'organisationUnitGroupSet',
    'organisationUnitSelectionMode',
    'params',
    'periodName',
    'periodType',
    'renderingStrategy',
    'program',
    'programStage',
    'programStatus',
    'radiusHigh',
    'radiusLow',
    'rows',
    'serverCluster',
    'startDate',
    'styleDataItem',
    'thematicMapType',
    'trackedEntityType',
    'valueType',
    'relationshipType',
    'relatedPointColor',
    'relatedPointRadius',
    'relationshipLineColor',
    'relationshipOutsideProgram',
];

const models = ['program', 'programStage', 'organisationUnitGroupSet'];

const validModelProperties = [
    'id',
    'name',
    'dimensionType',
    'dimensionItemType',
];

export const cleanMapConfig = ({ config, defaultBasemap }) => ({
    ...omitBy(isNil, pick(validMapProperties, config)),
    basemap: getBasemapString(config.basemap || defaultBasemap),
    mapViews: config.mapViews.map(cleanLayerConfig),
});

//TODO - use system settings default basemap
const getBasemapString = basemap => {
    if (!basemap) {
        return DEFAULT_BASEMAP_ID;
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
    const { layer } = config;

    Object.keys(config).forEach(key => {
        config[key] = models.includes(key)
            ? pick(validModelProperties, config[key])
            : config[key];
    });

    if (config.rows) {
        config.rows = config.rows.map(cleanDimension);
    }

    if (layer === EARTH_ENGINE_LAYER) {
        const { datasetId: id, band, params, aggregationType, filter } = config;

        const eeConfig = {
            id,
            params,
            band,
            aggregationType,
            filter,
        };

        // Removes undefined keys before stringify
        Object.keys(eeConfig).forEach(
            key => eeConfig[key] === undefined && delete eeConfig[key]
        );

        config.config = JSON.stringify(eeConfig);

        delete config.datasetId;
        delete config.params;
        delete config.filter;
        delete config.filters;
        delete config.periodType;
        delete config.periodName;
        delete config.aggregationType;
        delete config.band;
    } else if (layer === TRACKED_ENTITY_LAYER) {
        config.config = JSON.stringify({
            relationships: config.relationshipType
                ? {
                      type: config.relationshipType,
                      pointColor: config.relatedPointColor,
                      pointRadius: config.relatedPointRadius,
                      lineColor: config.relationshipLineColor,
                      relationshipOutsideProgram:
                          config.relationshipOutsideProgram,
                  }
                : null,
            periodType: config.periodType,
        });

        delete config.relationshipType;
        delete config.relatedPointColor;
        delete config.relatedPointRadius;
        delete config.relationshipLineColor;
        delete config.relationshipOutsideProgram;
        delete config.periodType;
    }

    if (isObject(config.config)) {
        config.config = JSON.stringify(config.config); // External overlay
    }

    if (config.styleDataItem) {
        // Remove legendSet from styleDataItem as this is stored in a separate property
        // Remove names as these can be translated and will be fetched on layer load
        config.styleDataItem = omit(
            ['legendSet', 'name', 'optionSet.name'],
            config.styleDataItem
        );

        if (config.styleDataItem.optionSet) {
            // Remove name and code from options as these are not persistent
            config.styleDataItem.optionSet.options.forEach(option => {
                delete option.name;
                delete option.code;
            });
        }
    }

    return config;
};

export const cleanDimension = dim => ({
    ...dim,
    items: dim.items.map(item => pick(validModelProperties, item)),
});
