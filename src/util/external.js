import { getExternalLayer } from './requests';
import { EXTERNAL_LAYER } from '../constants/layers';

// Create external layer from a model
export const createExternalLayer = model => ({
    layer: EXTERNAL_LAYER,
    id: model.id,
    name: model.name,
    opacity: 1,
    config: createExternalLayerConfig(model),
});

// Create external layer config
export const createExternalLayerConfig = model => {
    const {
        id,
        name,
        attribution,
        mapService,
        url,
        layers,
        imageFormat,
        legendSet,
        legendSetUrl,
    } = model;

    const type = mapService === 'WMS' ? 'wmsLayer' : 'tileLayer';
    const format = imageFormat === 'JPG' ? 'image/jpeg' : 'image/png';
    const tms = mapService === 'TMS';

    return {
        id,
        type,
        url,
        attribution,
        name,
        layers,
        tms,
        format,
        legendSet,
        legendSetUrl,
    };
};

// Parse external layer config returned as a string in ao
export const parseLayerConfig = async layerConfig => {
    let config;

    try {
        config = JSON.parse(layerConfig);
    } catch (evt) {
        return;
    }

    // We could use the config object as stored, but better to
    // use a fresh layer config from the API
    if (config.id) {
        try {
            const layer = await getExternalLayer(config.id);
            return createExternalLayerConfig(layer);
        } catch (evt) {
            return config;
        }
    }

    return config;
};
