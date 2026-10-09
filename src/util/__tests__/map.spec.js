import { onFullscreenChange, resizeAndFitBounds, toGeoJson } from '../map.js'

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
