import { layerTypes } from '../components/map/MapApi.js'
import { defaultBasemaps } from '../constants/basemaps.js'
import { BING_LAYER, MAP_LAYER_POSITION_BASEMAP } from '../constants/layers.js'
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
import { fetchExternalLayersQuery } from './requests.js'

export const appQueries = {
    currentUser: {
        resource: 'me',
        params: {
            fields: 'id,username,displayName~rename(name),authorities,settings[keyAnalysisDisplayProperty]',
        },
    },
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
    systemInfo: {
        resource: 'system/info',
    },
    userSettings: {
        resource: 'userSettings',
        params: {
            key: ['keyUiLocale'],
        },
    },
    externalMapLayers: fetchExternalLayersQuery,
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
                ? basemap.config.type !== BING_LAYER
                : true
        )
        .map((basemap) => {
            if (basemap.config.type === BING_LAYER) {
                basemap.config.apiKey = systemSettings.keyBingMapsApiKey
            }
            return basemap
        })
        .concat(externalBasemaps)
}

const getLayerTypes = (externalMapLayers) => {
    const externalLayerTypes = externalMapLayers
        .filter(
            (layer) => layer.mapLayerPosition !== MAP_LAYER_POSITION_BASEMAP
        )
        .filter((layer) => supportedMapServices.includes(layer.mapService))
        .map(createExternalOverlayLayer)
        .filter((overlay) => layerTypes.includes(overlay.config.type))

    return getDefaultLayerTypes().concat(externalLayerTypes)
}

export const providerDataTransformation = ({
    currentUser,
    systemSettings,
    systemInfo,
    userSettings,
    externalMapLayers,
}) => ({
    currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        authorities: new Set(currentUser.authorities),
    },
    nameProperty:
        currentUser.settings.keyAnalysisDisplayProperty === 'name'
            ? 'displayName'
            : 'displayShortName',
    systemSettings: Object.assign({}, DEFAULT_SYSTEM_SETTINGS, systemSettings, {
        hiddenPeriods: getHiddenPeriods(systemSettings),
    }),
    periodsSettings: {
        locale: userSettings.keyUiLocale,
        calendar: systemInfo.calendar,
    },
    basemaps: getBasemapList(
        externalMapLayers.externalMapLayers,
        systemSettings
    ),
    layerTypes: getLayerTypes(externalMapLayers.externalMapLayers),
})
