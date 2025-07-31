import { Analytics } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../actions/layers.js'
import { useCachedData } from '../components/cachedDataProvider/CachedDataProvider.jsx'
import useLoaderAlerts from '../components/loaders/useLoaderAlerts.js'
import { EVENT_LAYER } from '../constants/layers.js'
import earthEngineLoader from '../loaders/earthEngineLoader.js'
import eventLoader from '../loaders/eventLoader.js'
import externalLoader from '../loaders/externalLoader.js'
import facilityLoader from '../loaders/facilityLoader.js'
import geoJsonUrlLoader from '../loaders/geoJsonUrlLoader.js'
import orgUnitLoader from '../loaders/orgUnitLoader.js'
import thematicLoader from '../loaders/thematicLoader.js'
import trackedEntityLoader from '../loaders/trackedEntityLoader.js'

const loaders = {
    earthEngine: earthEngineLoader,
    event: eventLoader,
    external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    thematic: thematicLoader,
    geoJsonUrl: geoJsonUrlLoader,
    trackedEntity: trackedEntityLoader,
}

export const useLayersLoader = () => {
    const { baseUrl, serverVersion } = useConfig()
    const engine = useDataEngine()
    const [analyticsEngine] = useState(() => Analytics.getAnalytics(engine))
    const { currentUser } = useCachedData()
    const { showAlerts } = useLoaderAlerts()
    const allLayers = useSelector((state) => state.map.mapViews)
    const dataTable = useSelector((state) => state.dataTable)
    const dispatch = useDispatch()
    const { show: showLoaderAlert } = useAlert(
        ({ layer }) => `Could not load layer ${layer}`,
        { critical: true }
    )

    const { keyAnalysisDisplayProperty, id: userId } = currentUser

    useEffect(() => {
        async function loadLayer(config, loader) {
            const result = await loader({
                config,
                engine,
                keyAnalysisDisplayProperty, // name/shortName
                userId,
                baseUrl,
                analyticsEngine, // Thematic and Event loader
                serverVersion, // Tracked entity loader
                loadExtended: !!dataTable, // Event loader
            })
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            dispatch(updateLayer(result))
        }

        const unloadedLayers = allLayers.filter((layer) => {
            if (layer.isLoading) {
                return false
            } else {
                // The layer is not loaded - load it
                if (!layer.isLoaded) {
                    return true
                }

                // The layer is loaded but the data table is now displayed and
                // event extended data hasn't been loaded yet - so load it
                if (
                    layer.layer === EVENT_LAYER &&
                    layer.id === dataTable &&
                    !layer.isExtended &&
                    !layer.serverCluster
                ) {
                    return true
                }

                return false
            }
        })

        // only load layers that have not yet been loaded
        unloadedLayers.forEach((layerConfig) => {
            const loader = loaders[layerConfig.layer]
            if (!loader) {
                showLoaderAlert({ layer: layerConfig.layer })
                return
            }
            dispatch(setLayerLoading(layerConfig.id))
            loadLayer(layerConfig, loader)
        })
    }, [
        allLayers,
        dispatch,
        keyAnalysisDisplayProperty,
        userId,
        engine,
        analyticsEngine,
        showAlerts,
        showLoaderAlert,
        baseUrl,
        dataTable,
        serverVersion,
    ])
}
