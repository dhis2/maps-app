import { getInstance as getD2 } from 'd2/lib/d2';
import { mapFields } from './helpers';
import isString from 'lodash/fp/isString';
import isObject from 'lodash/fp/isObject';
import sortBy from 'lodash/fp/sortBy';

// API requests

// Fetch one favorite
export const mapRequest = async id => {
    const d2 = await getD2();
    const getMapConfig = d2.models.map.get(id, {fields: await mapFields()}).then(getBasemap);
    const getFavoriteViews = d2.Api.getApi().get(`dataStatistics/favorites/${id}`).then(json => json.views);

    return Promise.all([getMapConfig, getFavoriteViews])
        .then(([mapConfig, favoriteViews]) => ({
            ...mapConfig,
            mapViews: upgradeGisAppLayers(mapConfig.mapViews),
            favoriteViews: favoriteViews,
        }));
};

// Fetch one external layer
export const getExternalLayer = async id => {
    const d2 = await getD2();
    return d2.models.externalMapLayers.get(id);
};

// Different ways of specifying a basemap - TODO: simplify!
const getBasemap = config => {
    const externalBasemap = config.mapViews.find(
        view =>
            view.layer === 'external' &&
            JSON.parse(view.config || {}).mapLayerPosition === 'BASEMAP'
    );
    let basemap = { id: 'osmLight' }; // Default basemap
    let mapViews = config.mapViews;

    if (externalBasemap) {
        basemap = JSON.parse(externalBasemap.config);
        mapViews = config.mapViews.filter(
            view => view.id !== externalBasemap.id
        );
    } else if (isString(config.basemap)) {
        basemap =
            config.basemap === 'none'
                ? { id: 'osmLight', isVisible: false }
                : { id: config.basemap };
    } else if (isObject(config.basemap)) {
        basemap = config.basemap;
    }

    return {
        ...config,
        basemap: basemap,
        mapViews: mapViews,
    };
};

// Layer order in the previous GIS app (bottom to top)
const gisAppLayerOrder = {
    externalLayer: 1, // TODO: Distinguish between basemaps and overlays
    earthEngine: 2,
    thematic4: 3,
    thematic3: 4,
    thematic2: 5,
    thematic1: 6,
    boundary: 7,
    facility: 8,
    event: 9,
};

// Detection if map config is from previous GIS app
// TODO: Better to store app version as part of config object?
const isGisAppFormat = layers =>
    layers.some(config => config.layer.match(/thematic[1-4]/));

const upgradeGisAppLayers = layers => {
    if (!isGisAppFormat(layers)) {
        return layers;
    }

    return sortBy(config => gisAppLayerOrder[config.layer], layers).map(
        config => ({
            ...config,
            layer: config.layer.replace(/\d$/, ''), // Remove thematic number used in previous versions
        })
    );
};

// https://davidwalsh.name/query-string-javascript
export const getUrlParameter = name => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
