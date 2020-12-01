import { getInstance as getD2 } from 'd2';

export const loadExternalLayer = async id => {
    const d2 = await getD2();
    return d2.models.externalMapLayers.get(id);
};

export const createExternalLayer = layer => ({
    layer: 'external',
    id: layer.id,
    name: layer.name,
    opacity: 1,
    config: createExternalLayerConfig(layer),
});

export const createExternalLayerConfig = layer => {
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
    } = layer;

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
