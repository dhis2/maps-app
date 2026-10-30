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
        highlight: jest.fn(),
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

    test('zooms to the whole layer when the feature has no id', () => {
        const layer = createLayer()
        focus(layer, { layerId: 'layer1', zoom: true })
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
