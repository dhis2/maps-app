import { layerTypes } from '../components/map/MapApi.js'
import { MAP_LAYER_POSITION_BASEMAP } from '../constants/layers.js'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
} from '../constants/settings.js'
import { getBasemapList } from './basemaps.js'
import { createExternalOverlayLayer, supportedMapServices } from './external.js'
import { getDefaultLayerTypes } from './getDefaultLayerTypes.js'
import { getUserOrgUnitIdsByKeyword } from './orgUnits.js'
import { getHiddenPeriods } from './periods.js'
import { CURRENT_USER_FIELDS, EXTERNAL_MAP_LAYERS_QUERY } from './requests.js'

export const appQueries = {
    currentUser: {
        resource: 'me',
        params: {
            fields: `${CURRENT_USER_FIELDS},settings[keyAnalysisDisplayProperty,keyUiLocale]`,
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
            fields: 'calendar,dateFormat,databaseInfo[spatialSupport]',
        },
    },
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
}) => ({
    currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        authorities: new Set(currentUser.authorities),
        keyAnalysisDisplayProperty:
            currentUser.settings.keyAnalysisDisplayProperty,
        userOrgUnitIdsByKeyword: getUserOrgUnitIdsByKeyword(
            currentUser.organisationUnits
        ),
    },
    nameProperty:
        currentUser.settings.keyAnalysisDisplayProperty === 'name'
            ? 'displayName'
            : 'displayShortName',
    systemSettings: {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...systemSettings,
        hiddenPeriods: getHiddenPeriods(systemSettings),
    },
    periodsSettings: {
        locale: currentUser.settings.keyUiLocale,
        calendar: systemInfo.calendar,
        dateFormat: systemInfo.dateFormat,
    },
    spatialSupport: systemInfo.databaseInfo?.spatialSupport,
    basemaps: await getBasemapList({
        externalMapLayers: externalMapLayers.externalMapLayers,
        systemSettings,
    }),
    defaultLayerSources: getDefaultLayerSources(
        externalMapLayers.externalMapLayers
    ),
})
