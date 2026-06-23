import { useDataEngine } from '@dhis2/app-runtime'
import { useEffect } from 'react'
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

    useEffect(() => {
        // Write the default layer sources to the key and load them
        const resetToDefaults = async (type) => {
            await engine.mutate({
                resource: resourceLayerSourcesVisibility,
                type,
                data: layerSourceDefaultIds,
            })
            dispatch(initLayerSources(layerSourceDefaultIds))
        }

        const loadDataStore = async () => {
            const { dataStore } = await engine.query({
                dataStore: { resource: 'dataStore' },
            })

            if (!dataStore.includes(MAPS_APP_NAMESPACE)) {
                // Create namespace/key if missing in datastore
                await resetToDefaults('create')
                return
            }

            try {
                const { layerSourcesVisibility } = await engine.query({
                    layerSourcesVisibility: {
                        resource: resourceLayerSourcesVisibility,
                    },
                })

                if (!Array.isArray(layerSourcesVisibility)) {
                    // Reset namespace/key if integrity has been broken
                    await resetToDefaults('update')
                    return
                }

                const { ids, changed } = applyUpdates(layerSourcesVisibility)
                const validIds = earthEngineLayersIds().filter((id) =>
                    ids.includes(id)
                )
                if (changed) {
                    await engine.mutate({
                        resource: resourceLayerSourcesVisibility,
                        type: 'update',
                        data: validIds,
                    })
                }
                dispatch(initLayerSources(validIds))
            } catch {
                // Create key if missing in namespace
                await resetToDefaults('create')
            }
        }

        loadDataStore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
