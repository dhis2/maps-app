import i18n from '@dhis2/d2-i18n';
import { isNil, omitBy, pick, isObject, omit } from 'lodash/fp';
import { generateUid } from 'd2/uid';
import { upgradeGisAppLayers } from './requests';

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
        const { datasetId, params, filter, periodName } = config;

        // EE layer config
        config.config = JSON.stringify({
            id: datasetId,
            params,
            image: filter ? filter[0].arguments[1] : null,
            filter,
            periodName,
        });
        delete config.datasetId;
        delete config.params;
        delete config.filter;
        delete config.periodName;
    } else if (config.layer === 'trackedEntity') {
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

// Set external basemap from mapViews (old format)
const setExternalBasemap = config => {
    const { mapViews } = config;
    const externalBasemap = mapViews.find(view => {
        if (view.layer === 'external') {
            if (typeof view.config === 'string') {
                view.config = JSON.parse(view.config);
            }

            return view.config.mapLayerPosition === 'BASEMAP';
        }
        return false;
    });

    if (!externalBasemap) {
        return config;
    }

    return {
        ...config,
        basemap: { id: externalBasemap.config.id },
        mapViews: mapViews.filter(view => view.id !== externalBasemap.id),
    };
};

// Translate from chart/pivot config to map config, or from the old GIS app format
export const translateConfig = config => {
    // If chart/pivot config
    if (!config.mapViews) {
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
                alerts: [
                    {
                        critical: true,
                        message: `${name}: ${i18n.t(
                            'Map could not be created'
                        )}`,
                    },
                ],
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

    const newConfig = setExternalBasemap(config);

    return {
        ...newConfig,
        mapViews: upgradeGisAppLayers(newConfig.mapViews),
    };
};
