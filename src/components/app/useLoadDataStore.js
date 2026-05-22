import { useDataEngine } from '@dhis2/app-runtime'
import { useDispatch } from 'react-redux'
import { initLayerSources } from '../../actions/layerSources.js'
import {
    earthEngineLayersUpdates,
    earthEngineLayersIds,
    earthEngineLayersDefaultIds,
} from '../../constants/earthEngineLayers/index.js'
import {
    MAPS_APP_NAMESPACE,
    MAPS_APP_KEY_MANAGED_LAYER_SOURCES,
} from '../../constants/settings.js'

const applyUpdates = (currentIds) => {
    const hasUpdates = currentIds.some((id) => id in earthEngineLayersUpdates)
    if (!hasUpdates) {
        return { ids: currentIds, changed: false }
    }
    const updatedIds = currentIds.map(
        (id) => earthEngineLayersUpdates[id] || id
    )
    return { ids: updatedIds, changed: true }
}

export const useLoadDataStore = () => {
    // Keys: MAPS_APP_KEY_MANAGED_LAYER_SOURCES
    const resourceLayerSourcesVisibility = `dataStore/${MAPS_APP_NAMESPACE}/${MAPS_APP_KEY_MANAGED_LAYER_SOURCES}`
    const layerSourceDefaultIds = [...earthEngineLayersDefaultIds()]
    const dispatch = useDispatch()
    const engine = useDataEngine()
    engine
        .query({ dataStore: { resource: 'dataStore' } })
        .then(({ dataStore }) => {
            if (!dataStore.includes(MAPS_APP_NAMESPACE)) {
                // Create namespace/key if missing in datastore
                engine
                    .mutate({
                        resource: resourceLayerSourcesVisibility,
                        type: 'create',
                        data: layerSourceDefaultIds,
                    })
                    .then(() => {
                        dispatch(initLayerSources(layerSourceDefaultIds))
                    })
            } else {
                engine
                    .query({
                        layerSourcesVisibility: {
                            resource: resourceLayerSourcesVisibility,
                        },
                    })
                    .then(({ layerSourcesVisibility }) => {
                        if (!Array.isArray(layerSourcesVisibility)) {
                            // Reset namespace/key if integrity has been broken
                            engine
                                .mutate({
                                    resource: resourceLayerSourcesVisibility,
                                    type: 'update',
                                    data: layerSourceDefaultIds,
                                })
                                .then(() => {
                                    dispatch(
                                        initLayerSources(layerSourceDefaultIds)
                                    )
                                })
                        } else {
                            const { ids, changed } = applyUpdates(
                                layerSourcesVisibility
                            )
                            const validIds = earthEngineLayersIds().filter(
                                (id) => ids.includes(id)
                            )
                            if (changed) {
                                engine
                                    .mutate({
                                        resource:
                                            resourceLayerSourcesVisibility,
                                        type: 'update',
                                        data: validIds,
                                    })
                                    .then(() => {
                                        dispatch(initLayerSources(validIds))
                                    })
                            } else {
                                dispatch(initLayerSources(validIds))
                            }
                        }
                    })
                    .catch(() => {
                        // Create key if missing in namespace
                        engine
                            .mutate({
                                resource: resourceLayerSourcesVisibility,
                                type: 'create',
                                data: layerSourceDefaultIds,
                            })
                            .then(() => {
                                dispatch(
                                    initLayerSources(layerSourceDefaultIds)
                                )
                            })
                    })
            }
        })
}
