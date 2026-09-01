import { useCallback, useSyncExternalStore } from 'react'
import { createPrototypeStore } from './prototypeStore.js'

// PROTOTYPE ONLY - sources registered through the manage dialog. The real
// thing would POST to externalMapLayers and come back through useCachedData.
const store = createPrototypeStore({
    key: 'maps-prototype-added-layer-sources',
    initial: { sources: [] },
})

const useAddedLayerSources = () => {
    const state = useSyncExternalStore(store.subscribe, store.get)

    const addSource = useCallback(
        (source) =>
            store.set((prev) => ({
                ...prev,
                sources: [...prev.sources, source],
            })),
        []
    )

    return { addedSources: state.sources, addSource }
}

export default useAddedLayerSources
