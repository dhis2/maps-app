import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_PINNED_IDS } from '../util/layerSources.js'
import { createPrototypeStore } from './prototypeStore.js'

// PROTOTYPE ONLY - pinned layer sources, and the enabled/disabled state for
// built-in and external sources, kept in localStorage so it survives a reload
// while testing. The real thing belongs in the dataStore, next to the Earth
// Engine allow-list managed by useManagedLayerSourcesStore.
const store = createPrototypeStore({
    key: 'maps-prototype-layer-catalog',
    initial: { pinned: DEFAULT_PINNED_IDS, disabled: [] },
})

const toggle = (field, id) =>
    store.set((prev) => ({
        ...prev,
        [field]: prev[field].includes(id)
            ? prev[field].filter((item) => item !== id)
            : [...prev[field], id],
    }))

// Move a pinned id to the position of another one, keeping the rest in order
const reorder = (activeId, overId) =>
    store.set((prev) => {
        const oldIndex = prev.pinned.indexOf(activeId)
        const newIndex = prev.pinned.indexOf(overId)

        if (oldIndex === -1 || newIndex === -1) {
            return prev
        }

        const pinned = [...prev.pinned]
        pinned.splice(newIndex, 0, ...pinned.splice(oldIndex, 1))

        return { ...prev, pinned }
    })

const useLayerCatalogPrefs = () => {
    const state = useSyncExternalStore(store.subscribe, store.get)

    const togglePinned = useCallback((id) => toggle('pinned', id), [])
    const toggleDisabled = useCallback((id) => toggle('disabled', id), [])
    const reorderPinned = useCallback(
        (activeId, overId) => reorder(activeId, overId),
        []
    )

    return {
        pinnedIds: state.pinned,
        disabledIds: state.disabled,
        isPinned: useCallback(
            (id) => state.pinned.includes(id),
            [state.pinned]
        ),
        isDisabled: useCallback(
            (id) => state.disabled.includes(id),
            [state.disabled]
        ),
        togglePinned,
        toggleDisabled,
        reorderPinned,
    }
}

export default useLayerCatalogPrefs
