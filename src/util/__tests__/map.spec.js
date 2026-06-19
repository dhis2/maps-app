import { onFullscreenChange, resizeAndFitBounds } from '../map.js'

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
