import { renderHook, waitFor } from '@testing-library/react'
import { initLayerSources } from '../../../actions/layerSources.js'
import {
    earthEngineLayersIds,
    earthEngineLayersDefaultIds,
    earthEngineLayersUpdates,
} from '../../../constants/earthEngineLayers/index.js'
import { MAPS_APP_NAMESPACE } from '../../../constants/settings.js'
import { useLoadDataStore } from '../useLoadDataStore.js'

const mockDispatch = jest.fn()
let mockEngine

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
}))

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => mockEngine,
}))

const defaultIds = earthEngineLayersDefaultIds()

// Build an engine mock that answers the two distinct queries the hook makes:
// the top-level `dataStore` namespace list, and the managed layer sources key.
const setupEngine = ({
    namespaces = [],
    visibility,
    visibilityRejects,
} = {}) => {
    mockEngine = {
        query: jest.fn((q) => {
            if ('dataStore' in q) {
                return Promise.resolve({ dataStore: namespaces })
            }
            if ('layerSourcesVisibility' in q) {
                return visibilityRejects
                    ? Promise.reject(new Error('404'))
                    : Promise.resolve({ layerSourcesVisibility: visibility })
            }
            return Promise.resolve({})
        }),
        mutate: jest.fn().mockResolvedValue({}),
    }
}

describe('useLoadDataStore', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
    })

    it('queries the datastore once on mount, not on every render', async () => {
        setupEngine({ namespaces: [] })
        const { rerender } = renderHook(() => useLoadDataStore())

        // Force several re-renders, as App does on any redux state change
        rerender()
        rerender()
        rerender()

        // The regression: before the fix this fired on every render.
        expect(mockEngine.query).toHaveBeenCalledTimes(1)
        expect(mockEngine.query).toHaveBeenCalledWith({
            dataStore: { resource: 'dataStore' },
        })
    })

    it('creates the namespace key once with defaults when the namespace is missing', async () => {
        setupEngine({ namespaces: ['SOME_OTHER_APP'] })
        renderHook(() => useLoadDataStore())

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                initLayerSources(defaultIds)
            )
        )
        expect(mockEngine.mutate).toHaveBeenCalledTimes(1)
        expect(mockEngine.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'create', data: defaultIds })
        )
    })

    it('dispatches stored ids without mutating when there are no updates', async () => {
        const stored = earthEngineLayersDefaultIds()
        const expectedValidIds = earthEngineLayersIds().filter((id) =>
            stored.includes(id)
        )
        setupEngine({ namespaces: [MAPS_APP_NAMESPACE], visibility: stored })
        renderHook(() => useLoadDataStore())

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                initLayerSources(expectedValidIds)
            )
        )
        expect(mockEngine.mutate).not.toHaveBeenCalled()
    })

    it('migrates and persists ids when stored ids are outdated', async () => {
        const stored = Object.keys(earthEngineLayersUpdates)
        const updatedIds = stored.map(
            (id) => earthEngineLayersUpdates[id] || id
        )
        const expectedValidIds = earthEngineLayersIds().filter((id) =>
            updatedIds.includes(id)
        )
        setupEngine({ namespaces: [MAPS_APP_NAMESPACE], visibility: stored })
        renderHook(() => useLoadDataStore())

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                initLayerSources(expectedValidIds)
            )
        )
        expect(mockEngine.mutate).toHaveBeenCalledTimes(1)
        expect(mockEngine.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'update', data: expectedValidIds })
        )
    })

    it('resets the key to defaults when stored value is not an array', async () => {
        setupEngine({ namespaces: [MAPS_APP_NAMESPACE], visibility: {} })
        renderHook(() => useLoadDataStore())

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                initLayerSources(defaultIds)
            )
        )
        expect(mockEngine.mutate).toHaveBeenCalledTimes(1)
        expect(mockEngine.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'update', data: defaultIds })
        )
    })

    it('creates the key with defaults when the key query rejects', async () => {
        setupEngine({
            namespaces: [MAPS_APP_NAMESPACE],
            visibilityRejects: true,
        })
        renderHook(() => useLoadDataStore())

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                initLayerSources(defaultIds)
            )
        )
        expect(mockEngine.mutate).toHaveBeenCalledTimes(1)
        expect(mockEngine.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'create', data: defaultIds })
        )
    })
})
