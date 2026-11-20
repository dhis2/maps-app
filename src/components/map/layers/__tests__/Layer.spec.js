import {
    DURATION_DEFAULT,
    PADDING_DEFAULT,
} from '../../../../constants/layers.js'
import Layer from '../Layer.js'

const LAYER_BOUNDS = [
    [-13, 7],
    [-10, 10],
]

const createLayer = () => {
    const instance = Object.create(Layer.prototype)
    instance.props = { id: 'layer1' }
    instance.context = { map: { fitBounds: jest.fn() } }
    instance.layer = { highlight: jest.fn() }
    return instance
}

describe('Layer fitBounds', () => {
    test('fits the layer and keeps the map rotation', () => {
        const layer = createLayer()
        layer.layer.getBounds = () => LAYER_BOUNDS
        layer.context.map.getMapGL = () => ({ getBearing: () => 15 })
        layer.fitBounds()
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(LAYER_BOUNDS, {
            padding: PADDING_DEFAULT,
            duration: DURATION_DEFAULT,
            essential: true,
            bearing: 15,
        })
    })
})

const createHighlightLayer = () => {
    const instance = Object.create(Layer.prototype)
    instance.props = { id: 'layer1', feature: null }
    instance.state = {}
    instance.context = { map: { fitBounds: jest.fn() } }
    instance.layer = { highlight: jest.fn() }
    return instance
}

const highlight = (instance, feature) => {
    const prevProps = instance.props
    instance.props = { ...prevProps, feature }
    instance.componentDidUpdate(prevProps)
}

describe('Layer highlighted feature', () => {
    test('outlines the highlighted feature of this layer', () => {
        const layer = createHighlightLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        expect(layer.layer.highlight).toHaveBeenCalledWith('a')
    })

    test.each([
        ['the highlight ends', null],
        ['another layer is highlighted', { id: 'b', layerId: 'layer2' }],
    ])('clears the outline when %s', (_, next) => {
        const layer = createHighlightLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        highlight(layer, next)
        expect(layer.layer.highlight).toHaveBeenLastCalledWith(null)
    })

    test('does not redraw when the same feature is highlighted again', () => {
        const layer = createHighlightLayer()
        highlight(layer, { id: 'a', layerId: 'layer1', origin: 'table' })
        highlight(layer, { id: 'a', layerId: 'layer1', origin: 'map' })
        expect(layer.layer.highlight).toHaveBeenCalledTimes(1)
    })

    test('never moves the map', () => {
        const layer = createHighlightLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        expect(layer.context.map.fitBounds).not.toHaveBeenCalled()
    })

    test('outlines the highlighted feature again after the layer is rebuilt', async () => {
        const layer = createHighlightLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        const rebuilt = { highlight: jest.fn() }
        layer.removeLayer = jest.fn()
        layer.createLayer = jest.fn(() => {
            layer.layer = rebuilt
        })
        layer.setLayerOrder = jest.fn()
        layer.setLayerVisibility = jest.fn()
        await layer.updateLayer()
        expect(rebuilt.highlight).toHaveBeenCalledWith('a')
    })
})
