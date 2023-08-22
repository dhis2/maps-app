import { useDataEngine } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setLayerLoading, updateLayer } from '../actions/layers.js'
import useLoaderAlerts from '../components/loaders/useLoaderAlerts.js'
import { useSystemSettings } from '../components/SystemSettingsProvider.js'
// import earthEngineLoader from '../loaders/earthEngineLoader.js'
// import eventLoader from '../loaders/eventLoader.js'
// import externalLoader from '../loaders/externalLoader.js'
import facilityLoader from '../loaders/facilityLoader.js'
import orgUnitLoader from '../loaders/orgUnitLoader.js'
// import thematicLoader from '../loaders/thematicLoader.js'
// import trackedEntityLoader from '../loaders/trackedEntityLoader.js'

const loaders = {
    // earthEngine: EarthEngineLoader,
    // event: eventLoader,
    // external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    // thematic: thematicLoader,
    // trackedEntity: trackedEntityLoader,
}

export const useLayersLoader = () => {
    const engine = useDataEngine()
    const { show: showLoaderAlert } = useAlert(
        ({ layer }) => `Could not load layer ${layer}`,
        { critical: true }
    )
    const { keyAnalysisDisplayProperty: displayProperty } = useSystemSettings()
    const { showAlerts } = useLoaderAlerts()

    // only load layers that have not yet been loaded
    const layers = useSelector((state) =>
        state.map.mapViews.filter(
            (layer) =>
                !layer.isLoading &&
                (!layer.isLoaded || (layer.showDataTable && !layer.isExtended))
        )
    )
    const dispatch = useDispatch()

    useEffect(() => {
        async function loadLayer(config, loader) {
            const result = await loader({
                config,
                engine,
                displayProperty,
            })

            if (result.alerts) {
                showAlerts(result.alerts)
            }

            dispatch(updateLayer(result))
        }

        layers.forEach((layerConfig) => {
            const loader = loaders[layerConfig.layer]

            if (!loader) {
                showLoaderAlert({ layer: layerConfig.layer })
                return
            }

            dispatch(setLayerLoading(layerConfig.id))
            loadLayer(layerConfig, loader)
        })
    }, [layers, dispatch, displayProperty, engine, showAlerts, showLoaderAlert])
}
