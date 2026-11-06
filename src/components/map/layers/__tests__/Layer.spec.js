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

const highlight = (instance, feature) => {
    const prevProps = instance.props
    instance.props = { ...prevProps, feature }
    instance.syncHighlightedFeature(prevProps)
}

describe('Layer highlighted feature', () => {
    test('outlines the highlighted feature of this layer', () => {
        const layer = createLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        expect(layer.layer.highlight).toHaveBeenCalledWith('a')
    })

    test.each([
        ['the highlight ends', null],
        ['another layer is highlighted', { id: 'b', layerId: 'layer2' }],
    ])('clears the outline when %s', (_, next) => {
        const layer = createLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        highlight(layer, next)
        expect(layer.layer.highlight).toHaveBeenLastCalledWith(null)
    })

    test('does not redraw when the same feature is highlighted again', () => {
        const layer = createLayer()
        highlight(layer, { id: 'a', layerId: 'layer1', origin: 'table' })
        highlight(layer, { id: 'a', layerId: 'layer1', origin: 'map' })
        expect(layer.layer.highlight).toHaveBeenCalledTimes(1)
    })

    test('never moves the map', () => {
        const layer = createLayer()
        highlight(layer, { id: 'a', layerId: 'layer1' })
        expect(layer.context.map.fitBounds).not.toHaveBeenCalled()
    })
})

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
