import { getInstance as getD2 } from 'd2';
import { mapFields } from './helpers';
import { sortBy } from 'lodash/fp';
import { apiFetch } from './api';
import { extractBasemap } from '../util/extractBasemap';
// API requests

// Fetch one favorite
export const mapRequest = async id => {
    const d2 = await getD2();

    return d2.models.map
        .get(id, {
            fields: mapFields(),
        })
        .then(extractBasemap)
        .then(config => ({
            ...config,
            mapViews: upgradeGisAppLayers(config.mapViews),
        }));
};

const fetchMapQuery = {
    resource: 'maps',
    id: ({ id }) => id,
    params: {
        fields: mapFields(),
    },
};

export const fetchMap = async (id, engine) =>
    engine
        .query(
            { map: fetchMapQuery },
            {
                variables: {
                    id,
                },
            }
        )
        .then(map => extractBasemap(map.map))
        .then(config => ({
            ...config,
            mapViews: upgradeGisAppLayers(config.mapViews),
        }));

// const fetchOrgUnitsQuery = {
//     resource: 'organisationUnits',
//     params: {
//         userDataViewFallback: true,
//         fields:
//             'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
//     },
// };

export const fetchOrgUnits = async () => {
    // TODO - use d2 until correct dataQuery format can be determined
    const d2 = await getD2();
    const collection = await d2.models.organisationUnits.list({
        userDataViewFallback: true,
        fields:
            'id,path,displayName,children[id,path,displayName,children::isNotEmpty]',
    });
    return collection.toArray();
};

const fetchExternalLayersQuery = {
    resource: 'externalMapLayers',
    params: {
        paging: false,
        fields:
            'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
    },
};

export const fetchExternalLayers = async engine =>
    engine.query({ externalLayers: fetchExternalLayersQuery });

// Fetch one external layer
export const getExternalLayer = async id => {
    const d2 = await getD2();
    return d2.models.externalMapLayers.get(id);
};

export const fetchSystemSettings = keys =>
    apiFetch(`/systemSettings/?key=${keys.join(',')}`);

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

export const upgradeGisAppLayers = layers => {
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
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
