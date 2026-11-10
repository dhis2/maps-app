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

describe('Layer map hover', () => {
    const hover = (instance, properties) =>
        instance.onFeatureMouseEnter({ feature: { properties } })

    test('highlights the hovered feature of this layer', () => {
        const layer = createLayer()
        layer.props.highlightFeature = jest.fn()
        hover(layer, { id: 'a' })
        expect(layer.props.highlightFeature).toHaveBeenCalledWith({
            id: 'a',
            layerId: 'layer1',
            origin: 'map',
        })
    })

    test('highlights nothing for a feature without an id', () => {
        const layer = createLayer()
        layer.props.highlightFeature = jest.fn()
        hover(layer, {})
        expect(layer.props.highlightFeature).not.toHaveBeenCalled()
    })

    test('ends the highlight when the mouse leaves the feature', () => {
        const layer = createLayer()
        layer.props.highlightFeature = jest.fn()
        layer.onFeatureMouseLeave()
        expect(layer.props.highlightFeature).toHaveBeenCalledWith(null)
    })
})

describe('Layer table filters', () => {
    const createFilteredLayer = () => {
        const instance = createHighlightLayer()
        instance.props = { ...instance.props, data: [], dataFilters: null }
        instance.layer.setOpacity = jest.fn()
        instance.updateLayer = jest.fn()
        instance.setPeriod = jest.fn((callback) => callback())
        return instance
    }

    const update = (instance, props) => {
        const prevProps = instance.props
        instance.props = { ...prevProps, ...props }
        instance.componentDidUpdate(prevProps)
    }

    test('redraws the layer as a filter change when the table filters change', () => {
        const layer = createFilteredLayer()
        update(layer, { dataFilters: { name: 'Bo' } })
        expect(layer.updateLayer).toHaveBeenCalledWith(true)
    })

    test('resets the period before redrawing an edited layer', () => {
        const layer = createFilteredLayer()
        update(layer, { editCounter: 1 })
        expect(layer.setPeriod).toHaveBeenCalled()
        expect(layer.updateLayer).toHaveBeenCalled()
        expect(layer.setPeriod.mock.invocationCallOrder[0]).toBeLessThan(
            layer.updateLayer.mock.invocationCallOrder[0]
        )
    })

    test('does not redraw the layer when nothing it draws changes', () => {
        const layer = createFilteredLayer()
        update(layer, { opacity: 0.5 })
        expect(layer.updateLayer).not.toHaveBeenCalled()
    })
})
