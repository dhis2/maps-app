import { Analytics, useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../actions/layers.js'
import useLoaderAlerts from '../components/loaders/useLoaderAlerts.js'
// import earthEngineLoader from '../loaders/earthEngineLoader.js'
// import eventLoader from '../loaders/eventLoader.js'
import externalLoader from '../loaders/externalLoader.js'
import facilityLoader from '../loaders/facilityLoader.js'
import geoJsonUrlLoader from '../loaders/geoJsonUrlLoader.js'
import orgUnitLoader from '../loaders/orgUnitLoader.js'
import thematicLoader from '../loaders/thematicLoader.js'
// import trackedEntityLoader from '../loaders/trackedEntityLoader.js'

const loaders = {
    // earthEngine: EarthEngineLoader,
    // event: eventLoader,
    external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    thematic: thematicLoader,
    geoJsonUrl: geoJsonUrlLoader,

    // trackedEntity: trackedEntityLoader,
}

export const useLayersLoader = () => {
    const { baseUrl } = useConfig()
    const engine = useDataEngine()
    const [analyticsEngine] = useState(() => Analytics.getAnalytics(engine))
    const { show: showLoaderAlert } = useAlert(
        ({ layer }) => `Could not load layer ${layer}`,
        { critical: true }
    )
    const { nameProperty, currentUser } = useCachedDataQuery()
    const { showAlerts } = useLoaderAlerts()

    const allLayers = useSelector((state) => state.map.mapViews)
    const dispatch = useDispatch()

    useEffect(() => {
        async function loadLayer(config, loader) {
            const result = await loader({
                config,
                displayProperty: nameProperty,
                engine,
                analyticsEngine,
                baseUrl,
                keyAnalysisDisplayProperty:
                    currentUser.keyAnalysisDisplayProperty,
            })
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            dispatch(updateLayer(result))
        }

        const unloadedLayers = allLayers.filter(
            (layer) =>
                !layer.isLoading &&
                (!layer.isLoaded || (layer.showDataTable && !layer.isExtended))
        )

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
        nameProperty,
        currentUser.keyAnalysisDisplayProperty,
        engine,
        analyticsEngine,
        showAlerts,
        showLoaderAlert,
        baseUrl,
    ])
}
