import { isMapDirty } from '../mapDirty.js'

const baseMap = () => ({
    id: 'abc',
    name: 'My map',
    basemap: { id: 'osm', opacity: 1, isVisible: true },
    mapViews: [{ id: 'layer1', opacity: 1, isVisible: true }],
})

describe('isMapDirty', () => {
    it('is false when there is no saved snapshot yet', () => {
        expect(isMapDirty(baseMap(), null)).toBe(false)
    })

    it('is false for identical maps', () => {
        expect(isMapDirty(baseMap(), baseMap())).toBe(false)
    })

    it('is true when a layer is added', () => {
        const map = baseMap()
        map.mapViews = [...map.mapViews, { id: 'layer2', opacity: 1 }]

        expect(isMapDirty(map, baseMap())).toBe(true)
    })

    it('is true when a layer is removed', () => {
        const map = baseMap()
        map.mapViews = []

        expect(isMapDirty(map, baseMap())).toBe(true)
    })

    it('is true when the basemap changes', () => {
        const map = baseMap()
        map.basemap = { ...map.basemap, id: 'terrain' }

        expect(isMapDirty(map, baseMap())).toBe(true)
    })

    it('is true when a layer opacity changes', () => {
        const map = baseMap()
        map.mapViews = [{ ...map.mapViews[0], opacity: 0.5 }]

        expect(isMapDirty(map, baseMap())).toBe(true)
    })

    it('ignores ephemeral map-level fields', () => {
        const map = baseMap()
        map.coordinatePopup = { lat: 1, lng: 2 }
        map.alerts = [{ message: 'oops' }]

        expect(isMapDirty(map, baseMap())).toBe(false)
    })

    it('ignores ephemeral layer-level fields', () => {
        const map = baseMap()
        map.mapViews = [
            {
                ...map.mapViews[0],
                isLoading: true,
                coordinate: { lat: 1, lng: 2 },
                dataFilters: { field: 'x' },
                isExpanded: false,
                alerts: [{ message: 'oops' }],
            },
        ]

        expect(isMapDirty(map, baseMap())).toBe(false)
    })

    it('ignores ephemeral basemap fields', () => {
        const map = baseMap()
        map.basemap = { ...map.basemap, isExpanded: false }

        expect(isMapDirty(map, baseMap())).toBe(false)
    })

    it('ignores a client-only bounds field present on map but absent on savedMap', () => {
        const map = {
            ...baseMap(),
            bounds: [
                [-1, -1],
                [1, 1],
            ],
        }

        expect(isMapDirty(map, baseMap())).toBe(false)
    })

    it('ignores loader-added fields right after a fresh load (regression)', () => {
        const map = baseMap()
        map.mapViews = [
            {
                ...map.mapViews[0],
                isLoaded: true,
                isLoading: false,
                loadError: null,
                data: [{ type: 'Feature' }],
                periods: [{ id: '2024' }],
                valuesByPeriod: { 2024: [1, 2, 3] },
                legend: { items: [] },
                alerts: [{ message: 'partial data' }],
            },
        ]

        expect(isMapDirty(map, baseMap())).toBe(false)
    })

    it('still catches a real content change on a loaded layer', () => {
        const map = baseMap()
        map.mapViews = [
            {
                ...map.mapViews[0],
                isLoaded: true,
                data: [{ type: 'Feature' }],
                opacity: 0.3,
            },
        ]

        expect(isMapDirty(map, baseMap())).toBe(true)
    })
})
