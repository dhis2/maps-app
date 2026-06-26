import { useDataEngine } from '@dhis2/app-runtime'
import log from 'loglevel'
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
        // Guard against dispatching/mutating after unmount (and against
        // React 18 StrictMode running the effect twice in development)
        let cancelled = false

        // Write the default layer sources to the key and load them
        const resetToDefaults = async (type) => {
            await engine.mutate({
                resource: resourceLayerSourcesVisibility,
                type,
                data: layerSourceDefaultIds,
            })
            if (!cancelled) {
                dispatch(initLayerSources(layerSourceDefaultIds))
            }
        }

        const loadDataStore = async () => {
            const { dataStore } = await engine.query({
                dataStore: { resource: 'dataStore' },
            })

            if (cancelled) {
                return
            }

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

                if (cancelled) {
                    return
                }

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
                if (!cancelled) {
                    dispatch(initLayerSources(validIds))
                }
            } catch {
                if (!cancelled) {
                    // Create key if missing in namespace
                    await resetToDefaults('create')
                }
            }
        }

        loadDataStore().catch((error) =>
            log.error('Failed to load managed layer sources', error)
        )

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
