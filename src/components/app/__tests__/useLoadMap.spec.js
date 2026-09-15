import { renderHook, act, waitFor } from '@testing-library/react'
import history from '../../../util/history.js'
import { useLoadMap } from '../useLoadMap.js'

const mockDispatch = jest.fn()
let mockMapState
let mockSavedMapState

jest.mock('query-string', () => ({
    parse: jest.fn(() => ({})),
}))

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector) =>
        selector({ map: mockMapState, savedMap: mockSavedMapState }),
}))

const mockEngine = {
    query: jest.fn().mockResolvedValue({}),
    mutate: jest.fn().mockResolvedValue({}),
}

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => mockEngine,
}))

jest.mock('@dhis2/app-service-alerts', () => ({
    useAlert: () => ({ show: jest.fn() }),
}))

const mockCachedData = {
    systemSettings: { keyDefaultBaseMap: 'osm' },
    basemaps: [{ id: 'osm' }],
}

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => mockCachedData,
}))

jest.mock('../../../util/requests.js', () => ({
    fetchMap: jest.fn((args) =>
        Promise.resolve({
            id: args.id,
            basemap: { id: 'osm' },
            mapViews: [],
        })
    ),
}))

jest.mock('../../../util/basemaps.js', () => ({
    getBasemapOrFallback: ({ id }) => ({ id }),
}))

const dirtyMap = { id: 'map1', mapViews: [{ id: 'layer1', opacity: 0.5 }] }
const savedMap = { id: 'map1', mapViews: [{ id: 'layer1', opacity: 1 }] }

describe('useLoadMap - unsaved changes guard', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
        mockMapState = savedMap
        mockSavedMapState = savedMap
    })

    const mountOnMap = async (mapId) => {
        history.replace(`/${mapId}`)
        const hook = renderHook(() => useLoadMap())
        // Let the initial mount-time loadMap() resolve so previousParamsRef
        // picks up this map id before we simulate further navigation.
        await act(async () => {
            await Promise.resolve()
            await Promise.resolve()
        })
        return hook
    }

    it('shows a confirm dialog when dirty and switching to a different map', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')

        act(() => {
            history.push('/map2')
        })

        expect(result.current.locationToConfirm).not.toBeNull()
    })

    it('does not gate navigation when the map is not dirty', async () => {
        mockMapState = savedMap
        const { result } = await mountOnMap('map1')
        mockDispatch.mockClear()

        act(() => {
            history.push('/map2')
        })

        expect(result.current.locationToConfirm).toBeNull()
        await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    })

    it('confirmLeave navigates to the pending location and clears it', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')

        act(() => {
            history.push('/map2')
        })
        expect(result.current.locationToConfirm).not.toBeNull()

        mockDispatch.mockClear()
        await act(async () => {
            result.current.confirmLeave()
            await Promise.resolve()
            await Promise.resolve()
        })

        expect(result.current.locationToConfirm).toBeNull()
        expect(mockDispatch).toHaveBeenCalled()
    })

    it('cancelLeave clears the pending location without loading it', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')

        act(() => {
            history.push('/map2')
        })
        expect(result.current.locationToConfirm).not.toBeNull()

        mockDispatch.mockClear()
        act(() => {
            result.current.cancelLeave()
        })

        expect(result.current.locationToConfirm).toBeNull()
        expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('does not gate a Save As redirect even when dirty', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')
        mockDispatch.mockClear()

        act(() => {
            history.push('/map2', { isSaving: true })
        })

        expect(result.current.locationToConfirm).toBeNull()
        await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    })

    it('does not gate re-opening the same map while dirty', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')
        mockDispatch.mockClear()

        act(() => {
            history.replace('/map1')
        })

        expect(result.current.locationToConfirm).toBeNull()
        await waitFor(() => expect(mockDispatch).toHaveBeenCalled())
    })

    it('clears a pending confirm when the browser Back button reverts the navigation itself', async () => {
        mockMapState = dirtyMap
        const { result } = await mountOnMap('map1')

        act(() => {
            history.push('/map2')
        })
        expect(result.current.locationToConfirm).not.toBeNull()

        act(() => {
            history.back()
        })
        await waitFor(() => expect(history.location.pathname).toBe('/map1'))

        expect(result.current.locationToConfirm).toBeNull()
    })
})
