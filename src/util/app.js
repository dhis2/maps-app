import { defaultBasemaps } from '../constants/basemaps.js'
import { BING_LAYER } from '../constants/layers.js'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
    getHiddenPeriods,
} from '../constants/settings.js'
import { createExternalLayer } from './external.js'
import { getDefaultLayerTypes } from './getDefaultLayerTypes.js'
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
    externalMapLayers: fetchExternalLayersQuery,
}

const getBasemapList = (externalMapLayers, systemSettings) => {
    const externalBasemaps = externalMapLayers
        .filter((layer) => layer.mapLayerPosition === 'BASEMAP')
        .map(createExternalLayer)

    return defaultBasemaps()
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
        .filter((layer) => layer.mapLayerPosition !== 'BASEMAP')
        .map(createExternalLayer)

    return getDefaultLayerTypes().concat(externalLayerTypes)
}

export const providerDataTransformation = ({
    currentUser,
    systemSettings,
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
    basemaps: getBasemapList(
        externalMapLayers.externalMapLayers,
        systemSettings
    ),
    layerTypes: getLayerTypes(externalMapLayers.externalMapLayers),
})
