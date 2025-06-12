import i18n from '@dhis2/d2-i18n'
import { layerTypes } from '../components/map/MapApi.js'
import { defaultBasemaps } from '../constants/basemaps.js'
import {
    BING_LAYER,
    AZURE_LAYER,
    MS_LAYERS,
    MAP_LAYER_POSITION_BASEMAP,
} from '../constants/layers.js'
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

const UNKNOWN_LAYER = 'unknownLayer'
const TOKEN_VALIDATION_URLS = [
    [
        AZURE_LAYER,
        `https://atlas.microsoft.com/map/static/png?api-version=2.0&zoom=1&center=0,0&layer=basic&width=1&height=1&subscription-key=`,
    ],
    [
        BING_LAYER,
        `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=`,
    ],
]

const getMSKeyType = async (apiKey) => {
    if (apiKey) {
        for (const [type, url] of TOKEN_VALIDATION_URLS) {
            try {
                const response = await fetch(`${url}${apiKey}`)
                if (response.ok) {
                    return type
                }
            } catch (error) {
                continue
            }
        }
        console.warn(
            i18n.t(
                'The API key provided is not valid for either MS Bing or Azure.'
            )
        )
    } else {
        console.warn(i18n.t('No API key provided for either MS Bing or Azure.'))
    }
    return UNKNOWN_LAYER
}

const getBasemapList = async (externalMapLayers, systemSettings) => {
    const keyType = await getMSKeyType(systemSettings.keyBingMapsApiKey)
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
            MS_LAYERS.includes(basemap.config.type)
                ? keyType === basemap.config.type
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

export const providerDataTransformation = async ({
    currentUser,
    systemSettings,
    systemInfo,
    externalMapLayers,
}) => {
    return {
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
        systemSettings: Object.assign(
            {},
            DEFAULT_SYSTEM_SETTINGS,
            systemSettings,
            {
                hiddenPeriods: getHiddenPeriods(systemSettings),
            }
        ),
        periodsSettings: {
            locale: currentUser.settings.keyUiLocale,
            calendar: systemInfo.calendar,
            dateFormat: systemInfo.dateFormat,
        },
        basemaps: await getBasemapList(
            externalMapLayers.externalMapLayers,
            systemSettings
        ),
        defaultLayerSources: getDefaultLayerSources(
            externalMapLayers.externalMapLayers
        ),
    }
}
