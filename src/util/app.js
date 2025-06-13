import i18n from '@dhis2/d2-i18n'
import { layerTypes } from '../components/map/MapApi.js'
import { defaultBasemaps } from '../constants/basemaps.js'
import {
    KEYS_VALIDATION,
    LAYERS_TO_KEY_MAP,
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

export const validateKeys = async (systemSettings) => {
    const keysStatus = Object.values(KEYS_VALIDATION)
        .flat()
        .reduce((acc, { type }) => {
            acc[type] = false
            return acc
        }, {})

    for (const keyName of Object.keys(KEYS_VALIDATION)) {
        if (systemSettings[keyName]) {
            for (const { type, url } of KEYS_VALIDATION[keyName]) {
                try {
                    const response = await fetch(
                        `${url}${systemSettings[keyName]}`
                    )
                    if (response.ok) {
                        keysStatus[type] = true
                        return keysStatus
                    }
                } catch (error) {
                    continue
                }
            }
            console.warn(
                i18n.t(
                    '{{keyName}} is not valid for layer type(s): {{types}}',
                    {
                        keyName,
                        types: KEYS_VALIDATION[keyName]
                            .map((l) => l.type)
                            .join(', '),
                        nsSeparator: '^^',
                    }
                )
            )
        } else {
            console.warn(
                i18n.t(
                    '{{keyName}} is not provided for layer type(s): {{types}}',
                    {
                        keyName,
                        types: KEYS_VALIDATION[keyName]
                            .map((l) => l.type)
                            .join(', '),
                        nsSeparator: '^^',
                    }
                )
            )
        }
        return keysStatus
    }
}

export const getBasemapList = async ({ externalMapLayers, systemSettings }) => {
    const keysStatus = await validateKeys(systemSettings)
    const externalBasemaps = externalMapLayers
        .filter(
            (layer) => layer.mapLayerPosition === MAP_LAYER_POSITION_BASEMAP
        )
        .filter((layer) => supportedMapServices.includes(layer.mapService))
        .map(createExternalBasemapLayer)
        .filter((basemap) => layerTypes.includes(basemap.config.type))

    const basemapList = defaultBasemaps()
        .filter((basemap) => layerTypes.includes(basemap.config.type))
        .filter((basemap) =>
            Object.keys(keysStatus).includes(basemap.config.type)
                ? keysStatus[basemap.config.type]
                : true
        )
        .map((basemap) => {
            if (LAYERS_TO_KEY_MAP[basemap.config.type]) {
                basemap.config.apiKey =
                    systemSettings[LAYERS_TO_KEY_MAP[basemap.config.type]]
            }
            return basemap
        })
        .concat(externalBasemaps)

    return basemapList
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
        basemaps: await getBasemapList({
            externalMapLayers: externalMapLayers.externalMapLayers,
            systemSettings,
        }),
        defaultLayerSources: getDefaultLayerSources(
            externalMapLayers.externalMapLayers
        ),
    }
}
