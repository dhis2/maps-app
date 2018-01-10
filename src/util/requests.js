import { getInstance as getD2 } from 'd2/lib/d2';
import { mapFields } from './helpers';
import isString from 'lodash/fp/isString';
import isObject from 'lodash/fp/isObject';

// API requests

// Fetch one favorite
export const mapRequest = async (id) => {
    const d2 = await getD2();

    return d2.models.map.get(id, {
        fields: await mapFields(),
    }).then(getBasemap)
      .then((config) => ({
        ...config,
        mapViews: upgradeLayers(config.mapViews),
    }));
};


// Different ways of specifying a basemap - TODO: simplify!
const getBasemap = (config) => {
    const externalBasemap = config.mapViews.find(
        view => view.layer === 'external' &&
        JSON.parse(view.config || {}).mapLayerPosition === 'BASEMAP'
    );
    let basemap = { id: 'osmLight' }; // Default basemap
    let mapViews = config.mapViews;

    if (externalBasemap) {
        basemap = JSON.parse(externalBasemap.config);
        mapViews = config.mapViews.filter(view => view.id !== externalBasemap.id);
    } else if (isString(config.basemap)) {
        basemap = { id: config.basemap };
    } else if (isObject(config.basemap)) {
        basemap = config.basemap;
    }

    return {
        ...config,
        basemap: basemap,
        mapViews: mapViews,
    };
};

const upgradeLayers = (layers) => {
    return layers.map((layer) => ({
        ...layer,
        layer: layer.layer.replace(/\d$/, ''), // Remove thematic number used in previous versions
    }));
};