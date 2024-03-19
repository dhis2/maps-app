import {
    EXTERNAL_LAYER,
    TILE_LAYER,
    WMS_LAYER,
    VECTOR_STYLE,
    GEOJSON_URL_LAYER,
    GEOJSON_LAYER,
} from '../constants/layers.js'
import { getExternalLayer } from './requests.js'

const MAP_SERVICE_WMS = 'WMS'
const MAP_SERVICE_TMS = 'TMS'
const MAP_SERVICE_XYZ = 'XYZ'
const MAP_SERVICE_VECTOR_STYLE = 'VECTOR_STYLE'
const MAP_SERVICE_GEOJSON_URL = 'GEOJSON_URL'

const mapServiceToTypeMap = {
    [MAP_SERVICE_WMS]: WMS_LAYER,
    [MAP_SERVICE_XYZ]: TILE_LAYER,
    [MAP_SERVICE_TMS]: TILE_LAYER,
    [MAP_SERVICE_VECTOR_STYLE]: VECTOR_STYLE,
    [MAP_SERVICE_GEOJSON_URL]: GEOJSON_LAYER,
}

export const supportedMapServices = Object.keys(mapServiceToTypeMap)

export const createExternalBasemapLayer = (layer) => ({
    layer: EXTERNAL_LAYER,
    id: layer.id,
    name: layer.name,
    opacity: 1,
    config: createExternalLayerConfig(layer),
})

export const createExternalOverlayLayer = (layer) => ({
    layer:
        layer.mapService === MAP_SERVICE_GEOJSON_URL
            ? GEOJSON_URL_LAYER
            : EXTERNAL_LAYER,
    img: 'images/featurelayer.png',
    name: layer.name,
    opacity: 1,
    config: createExternalLayerConfig(layer),
})

// Create external layer config
const createExternalLayerConfig = (model) => {
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
export const parseLayerConfig = async (layerConfig) => {
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
            const layer = await getExternalLayer(config.id)
            const newConfig = createExternalLayerConfig(layer)
            newConfig.featureStyle = { ...config.featureStyle }
        } catch (evt) {
            return config
        }
    }

    return config
}
