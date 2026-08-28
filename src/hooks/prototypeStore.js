// PROTOTYPE ONLY - a minimal localStorage-backed store with subscribers, so
// sibling components (the Add layer button and the Basemap card) see each
// other's changes without a remount. The real thing belongs in the dataStore,
// next to the Earth Engine allow-list managed by useManagedLayerSourcesStore.
export const createPrototypeStore = ({ key, initial }) => {
    const read = () => {
        try {
            const stored = JSON.parse(window.localStorage.getItem(key))
            return stored === null ? initial : { ...initial, ...stored }
        } catch (error) {
            return initial
        }
    }

    let state = read()
    const listeners = new Set()

    const get = () => state

    const set = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater
        try {
            window.localStorage.setItem(key, JSON.stringify(state))
        } catch (error) {
            // ignore - prototype only
        }
        listeners.forEach((listener) => listener())
    }

    const subscribe = (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
    }

    return { get, set, subscribe }
}
