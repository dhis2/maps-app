import {
    fitCrossLayerZoomBounds,
    getLayerFeatureHighlight,
    onFullscreenChange,
    resizeAndFitBounds,
    toGeoJson,
} from '../map.js'

const bounds = [
    [0, 0],
    [1, 1],
]

const createMockMap = (layersBounds = bounds) => ({
    resize: jest.fn(),
    getLayersBounds: jest.fn(() => layersBounds),
    fitBounds: jest.fn(),
    toggleMultiTouch: jest.fn(),
    toggleScrollZoom: jest.fn(),
    getMapGL: jest.fn(() => ({ getBearing: jest.fn(() => 0) })),
})

describe('toGeoJson', () => {
    it("builds orgUnitPath as the parent graph plus the org unit's own id", () => {
        const [feature] = toGeoJson([
            {
                id: 'facility1',
                co: '[10,20]',
                ty: 1,
                na: 'Facility 1',
                pg: '/country1/region1',
                pi: 'region1',
                pn: 'Region 1',
                le: 4,
            },
        ])
        expect(feature.properties.orgUnitPath).toBe(
            '/country1/region1/facility1'
        )
    })

    it('falls back to just its own id when there is no parent graph (a root org unit)', () => {
        const [feature] = toGeoJson([
            {
                id: 'country1',
                co: '[10,20]',
                ty: 1,
                na: 'Country 1',
                pg: '',
                le: 1,
            },
        ])
        expect(feature.properties.orgUnitPath).toBe('/country1')
    })

    it('always adds a leading slash, even though the real geoFeatures API returns pg without one (unlike organisationUnits.path)', () => {
        const [feature] = toGeoJson([
            {
                id: 'facility1',
                co: '[10,20]',
                ty: 1,
                na: 'Facility 1',
                pg: 'country1/region1',
                pi: 'region1',
                pn: 'Region 1',
                le: 4,
            },
        ])
        expect(feature.properties.orgUnitPath).toBe(
            '/country1/region1/facility1'
        )
        expect(feature.properties.orgUnitOwn).toBe(
            '/country1/region1/facility1'
        )
    })
})

describe('getLayerFeatureHighlight', () => {
    it('returns null when there is no active highlight', () => {
        expect(getLayerFeatureHighlight(null, 'layerA')).toBeNull()
    })

    it("passes through a single-layer highlight for that layer's own id", () => {
        const feature = { id: 'f1', layerId: 'layerA' }
        expect(getLayerFeatureHighlight(feature, 'layerA')).toBe(feature)
    })

    it("hides a single-layer highlight from a layer that doesn't own it", () => {
        const feature = { id: 'f1', layerId: 'layerA' }
        expect(getLayerFeatureHighlight(feature, 'layerB')).toBeNull()
    })

    it('passes a crossLayerIds highlight through to every layer it names, despite layerId being null', () => {
        const feature = {
            layerId: null,
            crossLayerIds: { layerA: ['f1'], layerB: ['f2'] },
        }
        expect(getLayerFeatureHighlight(feature, 'layerA')).toBe(feature)
        expect(getLayerFeatureHighlight(feature, 'layerB')).toBe(feature)
    })

    it('hides a crossLayerIds highlight from a layer not named in it', () => {
        const feature = {
            layerId: null,
            crossLayerIds: { layerA: ['f1'] },
        }
        expect(getLayerFeatureHighlight(feature, 'layerC')).toBeNull()
    })
})

describe('fitCrossLayerZoomBounds', () => {
    const zoomFeature = {
        layerId: null,
        zoom: true,
        bounds,
        crossLayerIds: { layerA: ['a1'] },
    }

    it('fits the map to the precomputed bounds when the feature changes and carries zoom+bounds', () => {
        const map = createMockMap()
        fitCrossLayerZoomBounds(map, zoomFeature, null)
        expect(map.fitBounds).toHaveBeenCalledWith(
            bounds,
            expect.objectContaining({ essential: true })
        )
    })

    it('does nothing when the feature reference is unchanged', () => {
        const map = createMockMap()
        fitCrossLayerZoomBounds(map, zoomFeature, zoomFeature)
        expect(map.fitBounds).not.toHaveBeenCalled()
    })

    it('does nothing for a highlight with no zoom flag', () => {
        const map = createMockMap()
        fitCrossLayerZoomBounds(map, { ...zoomFeature, zoom: false }, null)
        expect(map.fitBounds).not.toHaveBeenCalled()
    })

    it('does nothing for a single-layer zoom (no precomputed bounds)', () => {
        const map = createMockMap()
        fitCrossLayerZoomBounds(
            map,
            { id: 'f1', layerId: 'layerA', zoom: true },
            null
        )
        expect(map.fitBounds).not.toHaveBeenCalled()
    })

    it('does nothing when there is no active feature', () => {
        const map = createMockMap()
        fitCrossLayerZoomBounds(map, null, zoomFeature)
        expect(map.fitBounds).not.toHaveBeenCalled()
    })
})

describe('resizeAndFitBounds', () => {
    it('resizes the map and fits bounds when layer bounds exist', () => {
        const map = createMockMap()

        resizeAndFitBounds(map)

        expect(map.resize).toHaveBeenCalledTimes(1)
        expect(map.fitBounds).toHaveBeenCalledWith(bounds)
    })

    it('resizes without fitting bounds when there are no layer bounds', () => {
        const map = createMockMap(null)

        resizeAndFitBounds(map)

        expect(map.resize).toHaveBeenCalledTimes(1)
        expect(map.fitBounds).not.toHaveBeenCalled()
    })
})

describe('onFullscreenChange', () => {
    let rafCallbacks

    beforeEach(() => {
        rafCallbacks = []
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
            rafCallbacks.push(cb)
            return rafCallbacks.length
        })
    })

    afterEach(() => {
        global.requestAnimationFrame.mockRestore()
    })

    const flushRaf = () => {
        while (rafCallbacks.length) {
            rafCallbacks.shift()()
        }
    }

    it('enables scroll zoom and disables multi-touch when entering fullscreen', () => {
        const map = createMockMap()

        onFullscreenChange(map, true)

        expect(map.toggleMultiTouch).toHaveBeenCalledWith(false)
        expect(map.toggleScrollZoom).toHaveBeenCalledWith(true)
    })

    it('disables scroll zoom and enables multi-touch when exiting fullscreen', () => {
        const map = createMockMap()

        onFullscreenChange(map, false)

        expect(map.toggleMultiTouch).toHaveBeenCalledWith(true)
        expect(map.toggleScrollZoom).toHaveBeenCalledWith(false)
    })

    it('defaults to non-fullscreen behaviour when isFullscreen is not provided', () => {
        const map = createMockMap()

        onFullscreenChange(map)

        expect(map.toggleMultiTouch).toHaveBeenCalledWith(true)
        expect(map.toggleScrollZoom).toHaveBeenCalledWith(false)
    })

    it('resizes and fits bounds once the canvas settles, on both enter and exit', () => {
        const enterMap = createMockMap()
        onFullscreenChange(enterMap, true)
        expect(enterMap.resize).not.toHaveBeenCalled()

        flushRaf()

        expect(enterMap.resize).toHaveBeenCalledTimes(1)
        expect(enterMap.fitBounds).toHaveBeenCalledWith(bounds)

        const exitMap = createMockMap()
        onFullscreenChange(exitMap, false)

        flushRaf()

        expect(exitMap.resize).toHaveBeenCalledTimes(1)
        expect(exitMap.fitBounds).toHaveBeenCalledWith(bounds)
    })
})
