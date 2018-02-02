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
        const dimensions = [...config.columns, ...config.rows, ...config.filters];
        const columns = [dimensions.find(dim => dim.dimension === 'dx')];
        const rows = [dimensions.find(dim => dim.dimension === 'ou')];
        const filters = [dimensions.find(dim => dim.dimension === 'pe')];

        if (!columns || !rows || !filters) {
            return {
                el,
                name,
                // alert
            }
        }

        // TODO: Temp to get some data
        filters[0].items[0] = {
            dimensionItemType: 'PERIOD',
            id: 'LAST_YEAR',
            name: 'LAST_YEAR',
        };

        return {
            el,
            name,
            // latitude: 8.325647599239064,
            // longitude: -10.659484863281252,
            // zoom: 8,
            basemap: 'osmLight',
            mapViews: [{
                id: generateUid(),
                name,
                layer: 'thematic',
                columns,
                rows,
                filters,
                // classes: 5,
                // method: 3,
                // colorScale: ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'],
            }]
        }
    }

    return config;
};



/*
{
  "id": "Sf0sJriqqVW",
  "name": "LLITN given after delivery",
  "method": 3,
  "labels": false,
  "favorite": false,
  "displayName": "LLITN given after delivery",
  "labelFontColor": "#000000",
  "layer": "thematic",
  "labelFontStyle": "normal",
  "radiusHigh": 15,
  "hideTitle": false,
  "eventClustering": false,
  "colorLow": "00447F",
  "opacity": 0.8,
  "parentLevel": 0,
  "parentGraphMap": {
  "ImspTQPwCqd": ""
},
  "labelFontSize": "11px",
  "colorHigh": "DAFFFF",
  "completedOnly": false,
  "eventPointRadius": 0,
  "hidden": false,
  "classes": 5,
  "hideSubtitle": false,
  "labelFontWeight": "normal",
  "radiusLow": 5,
  "dataElementGroupSetDimensions": [],
  "attributeDimensions": [],
  "translations": [],
  "interpretations": [],
  "columns": [{
  "dimension": "dx",
  "items": [{
    "id": "ntzmpYRSKGg",
    "name": "LLITN given after delivery",
    "dimensionItemType": "DATA_ELEMENT"
  }]
}],
  "dataElementDimensions": [],
  "categoryDimensions": [],
  "programIndicatorDimensions": [],
  "attributeValues": [],
  "userAccesses": [],
  "favorites": [],
  "dataDimensionItems": [{
  "dataDimensionItemType": "DATA_ELEMENT",
  "dataElement": {
    "id": "ntzmpYRSKGg"
  }
}],
  "categoryOptionGroupSetDimensions": [],
  "organisationUnitGroupSetDimensions": [],
  "filters": [{
  "dimension": "pe",
  "items": [{
    "id": "2017",
    "name": "2017",
    "dimensionItemType": "PERIOD"
  }]
}],
  "rows": [{
  "dimension": "ou",
  "items": [{
    "id": "ImspTQPwCqd",
    "name": "Sierra Leone",
    "dimensionItemType": "ORGANISATION_UNIT"
  }, {
    "id": "LEVEL-3",
    "name": "LEVEL-3"
  }]
}],
  "legend": {
  "title": "LLITN given after delivery",
    "items": [{
    "startValue": 4,
    "endValue": 49,
    "color": "#00447f",
    "count": 30
  }, {
    "startValue": 49,
    "endValue": 95,
    "color": "#36729f",
    "count": 30
  }, {
    "startValue": 95,
    "endValue": 184,
    "color": "#6da1bf",
    "count": 30
  }, {
    "startValue": 184,
    "endValue": 261,
    "color": "#a3d0df",
    "count": 30
  }, {
    "startValue": 261,
    "endValue": 3726,
    "color": "#daffff",
    "count": 32
  }],
    "period": "2017"
},
  "isLoaded": true,
  "isExpanded": true,
  "isVisible": true
}
  */