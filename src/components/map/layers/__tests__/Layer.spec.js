import {
    DURATION_DEFAULT,
    PADDING_DEFAULT,
} from '../../../../constants/layers.js'
import Layer from '../Layer.js'

const point = (coordinates) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
})

const LAYER_BOUNDS = [
    [-13, 7],
    [-10, 10],
]

const createLayer = ({ featuresById = {}, getFeaturesById = true } = {}) => {
    const instance = Object.create(Layer.prototype)
    instance.props = { id: 'layer1' }
    instance.context = {
        map: {
            fitBounds: jest.fn(),
            getMapGL: () => ({ getBearing: () => 15 }),
        },
    }
    instance.layer = {
        getBounds: () => LAYER_BOUNDS,
        ...(getFeaturesById && {
            getFeaturesById: (id) => featuresById[id],
        }),
    }
    return instance
}

const focus = (instance, feature) => {
    const prevProps = instance.props
    instance.props = { ...prevProps, feature }
    instance.syncFocusedFeature(prevProps)
}

describe('Layer zoom to the highlighted feature', () => {
    test('zooms to one feature, at most to zoom level 17', () => {
        const layer = createLayer({
            featuresById: { a: [point([-11, 8])] },
        })
        focus(layer, { id: 'a', layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(
            [
                [-11, 8],
                [-11, 8],
            ],
            {
                padding: PADDING_DEFAULT,
                duration: DURATION_DEFAULT,
                essential: true,
                maxZoom: 17,
            }
        )
    })

    test('zooms to the bounds of several features', () => {
        const layer = createLayer({
            featuresById: {
                a: [point([-12, 8])],
                b: [point([-11, 9]), point([-10.5, 7.5])],
            },
        })
        focus(layer, { ids: ['a', 'b'], layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(
            [
                [-12, 7.5],
                [-10.5, 9],
            ],
            expect.objectContaining({ maxZoom: 17 })
        )
    })

    test('zooms to the single id when the ids list is empty', () => {
        const layer = createLayer({
            featuresById: { a: [point([-11, 8])], b: [point([-12, 9])] },
        })
        focus(layer, { ids: [], id: 'a', layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(
            [
                [-11, 8],
                [-11, 8],
            ],
            expect.anything()
        )
    })

    test('prefers the ids list over the single id', () => {
        const layer = createLayer({
            featuresById: { a: [point([-11, 8])], b: [point([-12, 9])] },
        })
        focus(layer, { ids: ['b'], id: 'a', layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(
            [
                [-12, 9],
                [-12, 9],
            ],
            expect.anything()
        )
    })

    test('zooms to the whole layer when the feature has no id', () => {
        const layer = createLayer()
        focus(layer, { ids: [], layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(LAYER_BOUNDS, {
            padding: PADDING_DEFAULT,
            duration: DURATION_DEFAULT,
            essential: true,
            bearing: 15,
        })
    })

    test('skips features without geometry', () => {
        const layer = createLayer({
            featuresById: {
                a: [{ type: 'Feature', geometry: null }, point([-11, 8])],
            },
        })
        focus(layer, { id: 'a', layerId: 'layer1', zoom: true })
        expect(layer.context.map.fitBounds).toHaveBeenCalledWith(
            [
                [-11, 8],
                [-11, 8],
            ],
            expect.anything()
        )
    })

    test.each([
        ['the feature is only hovered', { id: 'a', layerId: 'layer1' }, {}],
        [
            'the feature belongs to another layer',
            { id: 'a', layerId: 'layer2', zoom: true },
            {},
        ],
        [
            'no feature with that id has a geometry',
            { id: 'a', layerId: 'layer1', zoom: true },
            { featuresById: { a: [{ type: 'Feature', geometry: null }] } },
        ],
        [
            'the features have no coordinates',
            { id: 'a', layerId: 'layer1', zoom: true },
            {
                featuresById: {
                    a: [
                        {
                            type: 'Feature',
                            geometry: { type: 'MultiPolygon', coordinates: [] },
                        },
                    ],
                },
            },
        ],
        [
            'the id matches no feature',
            { id: 'missing', layerId: 'layer1', zoom: true },
            {},
        ],
        [
            'the layer cannot look features up by id',
            { id: 'a', layerId: 'layer1', zoom: true },
            { getFeaturesById: false },
        ],
    ])('does not zoom when %s', (_, feature, options) => {
        const layer = createLayer({
            featuresById: { a: [point([-11, 8])] },
            ...options,
        })
        focus(layer, feature)
        expect(layer.context.map.fitBounds).not.toHaveBeenCalled()
    })

    test('does not zoom again when the same feature is passed down again', () => {
        const layer = createLayer({ featuresById: { a: [point([-11, 8])] } })
        const feature = { id: 'a', layerId: 'layer1', zoom: true }
        focus(layer, feature)
        focus(layer, feature)
        expect(layer.context.map.fitBounds).toHaveBeenCalledTimes(1)
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
