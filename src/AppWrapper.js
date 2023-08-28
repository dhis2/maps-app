import { CachedDataQueryProvider } from '@dhis2/analytics'
import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import { DataStoreProvider } from '@dhis2/app-service-datastore'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import log from 'loglevel'
import React from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import App from './components/app/App.js'
import OrgUnitsProvider from './components/OrgUnitsProvider.js'
import WindowDimensionsProvider from './components/WindowDimensionsProvider.js'
import { defaultBasemaps } from './constants/basemaps.js'
import { defaultLayerTypes, BING_LAYER } from './constants/layers.js'
import {
    DEFAULT_SYSTEM_SETTINGS,
    SYSTEM_SETTINGS,
    getHiddenPeriods,
} from './constants/settings.js'
import store from './store/index.js'
import { USER_DATASTORE_NAMESPACE } from './util/analyticalObject.js'
import { createExternalLayer } from './util/external.js'
import './locales/index.js'

log.setLevel(
    process.env.NODE_ENV === 'production' ? log.levels.INFO : log.levels.TRACE
)

const d2Config = {
    schemas: [
        'dataElement',
        'dataElementGroup',
        'dataSet',
        'externalMapLayer',
        'indicator',
        'indicatorGroup',
        'legendSet',
        'map',
        'optionSet',
        'organisationUnit',
        'organisationUnitGroup',
        'organisationUnitGroupSet',
        'organisationUnitLevel',
        'program',
        'programStage',
        'userGroup',
    ],
}

const query = {
    currentUser: {
        resource: 'me',
        params: {
            fields: 'id,username,displayName~rename(name),settings[keyAnalysisDisplayProperty]',
        },
    },
    systemSettings: {
        resource: 'systemSettings',
        params: {
            key: SYSTEM_SETTINGS,
        },
    },
    externalMapLayers: {
        resource: 'externalMapLayers',
        params: {
            fields: 'id,displayName~rename(name),service,url,attribution,mapService,layers,imageFormat,mapLayerPosition,legendSet,legendSetUrl',
            paging: false,
        },
    },
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

    return defaultLayerTypes().concat(externalLayerTypes)
}

const providerDataTransformation = ({
    currentUser,
    systemSettings,
    externalMapLayers,
}) => {
    return {
        currentUser: {
            id: currentUser.id,
            name: currentUser.name,
            username: currentUser.username,
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
        basemaps: getBasemapList(
            externalMapLayers.externalMapLayers,
            systemSettings
        ),
        layerTypes: getLayerTypes(externalMapLayers.externalMapLayers),
    }
}

const AppWrapper = () => {
    return (
        <ReduxProvider store={store}>
            <DataStoreProvider namespace={USER_DATASTORE_NAMESPACE}>
                <D2Shim d2Config={d2Config}>
                    {({ d2, d2Error }) => {
                        if (!d2 && !d2Error) {
                            return (
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        top: 0,
                                    }}
                                >
                                    <CenteredContent>
                                        <CircularLoader />
                                    </CenteredContent>
                                </div>
                            )
                        }
                        return (
                            <CachedDataQueryProvider
                                query={query}
                                dataTransformation={providerDataTransformation}
                            >
                                <WindowDimensionsProvider>
                                    <OrgUnitsProvider>
                                        <App />
                                    </OrgUnitsProvider>
                                </WindowDimensionsProvider>
                            </CachedDataQueryProvider>
                        )
                    }}
                </D2Shim>
            </DataStoreProvider>
        </ReduxProvider>
    )
}

export default AppWrapper
