import { layerTypes } from '../components/map/MapApi.js'
import { defaultBasemaps } from '../constants/basemaps.js'
import { MS_LAYERS, MAP_LAYER_POSITION_BASEMAP } from '../constants/layers.js'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../constants/settings.js'
import {
    createExternalBasemapLayer,
    createExternalOverlayLayer,
    supportedMapServices,
} from './external.js'
import { getDefaultLayerTypes } from './getDefaultLayerTypes.js'
import { getHiddenPeriods } from './periods.js'
import { EXTERNAL_MAP_LAYERS_QUERY } from './requests.js'

export const appQueries = {
    currentUser: {
        resource: 'me',
        params: {
            fields: 'id,username,displayName~rename(name),authorities,settings[keyAnalysisDisplayProperty,keyUiLocale]',
        },
    },
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
    externalMapLayers: EXTERNAL_MAP_LAYERS_QUERY,
    systemInfo: {
        resource: 'system/info',
        params: {
            fields: 'calendar,dateFormat',
        },
    },
}

const getBasemapList = (externalMapLayers, systemSettings) => {
    const externalBasemaps = externalMapLayers
        .filter(
            (layer) => layer.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP
        )
        .filter((layer) => supportedMapServices.includes(layer.mapService))
        .map(createExternalBasemapLayer)
        .filter((basemap) => layerTypes.includes(basemap.config.type))

    return defaultBasemaps()
        .filter((basemap) => layerTypes.includes(basemap.config.type))
        .filter((basemap) =>
            !systemSettings.keyBingMapsApiKey
                ? !MS_LAYERS.includes(basemap.config.type)
                : true
        )
        .map((basemap) => {
            if (MS_LAYERS.includes(basemap.config.type)) {
                basemap.config.apiKey = systemSettings.keyBingMapsApiKey
            }
            return basemap
        })
        .concat(externalBasemaps)
}

const getDefaultLayerSources = (externalMapLayers) => {
    const externalLayerSources = externalMapLayers
        .filter(
            (layer) => layer.mapLayerPosition !== MAP_LAYER_POSITION_BASEMAP
        )
        .filter((layer) => supportedMapServices.includes(layer.mapService))
        .map(createExternalOverlayLayer)
        .filter((overlay) => layerTypes.includes(overlay.config.type))

    return getDefaultLayerTypes().concat(externalLayerSources)
}

export const providerDataTransformation = ({
    currentUser,
    systemSettings,
    systemInfo,
    externalMapLayers,
}) => ({
    currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        authorities: new Set(currentUser.authorities),
        keyAnalysisDisplayProperty:
            currentUser.settings.keyAnalysisDisplayProperty,
    },
    nameProperty:
        currentUser.settings.keyAnalysisDisplayProperty === 'name'
            ? 'displayName'
            : 'displayShortName',
    systemSettings: Object.assign({}, DEFAULT_SYSTEM_SETTINGS, systemSettings, {
        hiddenPeriods: getHiddenPeriods(systemSettings),
    }),
    periodsSettings: {
        locale: currentUser.settings.keyUiLocale,
        calendar: systemInfo.calendar,
        dateFormat: systemInfo.dateFormat,
    },
    basemaps: getBasemapList(
        externalMapLayers.externalMapLayers,
        systemSettings
    ),
    defaultLayerSources: getDefaultLayerSources(
        externalMapLayers.externalMapLayers
    ),
})
