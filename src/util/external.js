import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
} from '../constants/layers.js'

const MAP_SERVICE_WMS = 'WMS'
const MAP_SERVICE_TMS = 'TMS'
const MAP_SERVICE_XYZ = 'XYZ'
const MAP_SERVICE_VECTOR_STYLE = 'VECTOR_STYLE'

const mapServiceToTypeMap = {
    [MAP_SERVICE_WMS]: WMS_LAYER,
    [MAP_SERVICE_XYZ]: TILE_LAYER,
    [MAP_SERVICE_TMS]: TILE_LAYER,
    [MAP_SERVICE_VECTOR_STYLE]: VECTOR_STYLE,
}

// Create external layer from a model
export const createExternalLayer = (model) => ({
    layer: EXTERNAL_LAYER,
    id: model.id,
    name: model.name,
    opacity: 1,
    config: createExternalLayerConfig(model),
})

// Create external layer config
export const createExternalLayerConfig = (model) => {
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
    } = model

    const type = mapServiceToTypeMap[mapService]

    const format = imageFormat === 'JPG' ? 'image/jpeg' : 'image/png'
    const tms = mapService === MAP_SERVICE_TMS

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
    }
}

// Parse external layer config returned as a string in ao
export const parseLayerConfig = async (layerConfig, d2) => {
    let config

    try {
        config = JSON.parse(layerConfig)
    } catch (evt) {
        return
    }

    // We could use the config object as stored, but better to
    // use a fresh layer config from the API
    if (config.id) {
        try {
            const layer = await d2.models.externalMapLayers.get(config.id)
            return createExternalLayerConfig(layer)
        } catch (evt) {
            return config
        }
    }

    return config
}
