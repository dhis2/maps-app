import { renderHook, waitFor } from '@testing-library/react'
import { FALLBACK_BASEMAP_ID } from '../../constants/basemaps.js'
import { defaultBasemapState } from '../../reducers/map.js'
import useBasemapConfig from '../useBasemapConfig.js'

let mockCachedData

jest.mock('../../components/cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => mockCachedData,
}))

describe('useBasemapConfig', () => {
    // `selected` must be a stable reference across re-renders: useBasemapConfig's
    // effect depends on it by reference, so passing a fresh literal on every
    // render (e.g. `renderHook(() => useBasemapConfig({}))`) would re-trigger the
    // effect on every setBasemap-caused re-render, looping forever.
    it('falls back to the default basemap when no basemap is selected and none is configured as system default', () => {
        mockCachedData = { systemSettings: {}, basemaps: [] }
        const selected = {}

        const { result } = renderHook(() => useBasemapConfig(selected))

        expect(result.current.id).toBe(FALLBACK_BASEMAP_ID)
        expect(result.current.isVisible).toBe(defaultBasemapState.isVisible)
    })

    it('resolves the selected basemap by id from the cached basemap list', () => {
        mockCachedData = {
            systemSettings: {},
            basemaps: [
                { id: 'sat1', name: 'Satellite', config: { type: 'raster' } },
            ],
        }
        const selected = { id: 'sat1' }

        const { result } = renderHook(() => useBasemapConfig(selected))

        expect(result.current.id).toBe('sat1')
        expect(result.current.name).toBe('Satellite')
    })

    it('falls back to the system default basemap when no basemap id is selected', () => {
        mockCachedData = {
            systemSettings: { keyDefaultBaseMap: 'sat1' },
            basemaps: [{ id: 'sat1', name: 'Satellite', config: {} }],
        }
        const selected = {}

        const { result } = renderHook(() => useBasemapConfig(selected))

        expect(result.current.id).toBe('sat1')
    })

    it('lets the selected opacity win over the cached basemap opacity', () => {
        const cachedBasemap = { id: 'sat1', name: 'Satellite', opacity: 0.3 }
        mockCachedData = {
            systemSettings: {},
            basemaps: [cachedBasemap],
        }
        const selected = { id: 'sat1', opacity: 0.7 }

        const { result } = renderHook(() => useBasemapConfig(selected))

        expect(result.current.opacity).toBe(0.7)
    })

    it('re-resolves the basemap when the selected basemap changes', async () => {
        mockCachedData = {
            systemSettings: {},
            basemaps: [
                { id: 'sat1', name: 'Satellite', config: {} },
                { id: 'osm1', name: 'OSM', config: {} },
            ],
        }

        const { result, rerender } = renderHook(
            ({ selected }) => useBasemapConfig(selected),
            { initialProps: { selected: { id: 'sat1' } } }
        )

        expect(result.current.id).toBe('sat1')

        rerender({ selected: { id: 'osm1' } })

        await waitFor(() => expect(result.current.id).toBe('osm1'))
    })
})
