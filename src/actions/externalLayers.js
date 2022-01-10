import log from 'loglevel';
import * as types from '../constants/actionTypes';
import { createExternalLayer } from '../util/external';
import { fetchExternalLayers } from '../util/requests';
import { addBasemaps } from './basemap';

const isBasemap = layer => layer.mapLayerPosition === 'BASEMAP';
const isOverlay = layer => !isBasemap(layer);

// Add external overlay
export const addExternalLayer = layer => ({
    type: types.EXTERNAL_LAYER_ADD,
    payload: layer,
});

export const tSetExternalLayers = engine => async dispatch => {
    try {
        const externalLayers = await fetchExternalLayers(engine);
        const externalBasemaps = externalLayers.externalLayers.externalMapLayers
            .filter(isBasemap)
            .map(createExternalLayer);

        dispatch(addBasemaps(externalBasemaps));

        externalLayers.externalLayers.externalMapLayers
            .filter(isOverlay)
            .map(createExternalLayer)
            .map(layer => dispatch(addExternalLayer(layer)));
    } catch (e) {
        log.error('Could not load external map layers');
        return e;
    }
};
