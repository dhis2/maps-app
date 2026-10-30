import { getFeaturesBounds, getZoomTarget } from '../zoom.js'

const point = (coordinates) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
})

describe('getZoomTarget', () => {
    test('prefers the ids list over the single id', () => {
        expect(
            getZoomTarget(
                { ids: ['a', 'b'], id: 'c', layerId: 'layer1', zoom: true },
                'layer1'
            )
        ).toEqual({ ids: ['a', 'b'] })
    })

    test('returns the single feature id otherwise', () => {
        expect(
            getZoomTarget({ id: 'a', layerId: 'layer1', zoom: true }, 'layer1')
        ).toEqual({ ids: ['a'] })
    })

    test('falls back to the single id when the ids list is empty', () => {
        expect(
            getZoomTarget(
                { ids: [], id: 'a', layerId: 'layer1', zoom: true },
                'layer1'
            )
        ).toEqual({ ids: ['a'] })
    })

    test('keeps a falsy id other than null or undefined', () => {
        expect(
            getZoomTarget({ id: 0, layerId: 'layer1', zoom: true }, 'layer1')
        ).toEqual({ ids: [0] })
    })

    test('returns the whole layer when the feature has no id', () => {
        expect(
            getZoomTarget({ ids: [], layerId: 'layer1', zoom: true }, 'layer1')
        ).toEqual({ layer: true })
    })

    test.each([
        ['there is no feature', null],
        ['the feature is only hovered', { id: 'a', layerId: 'layer1' }],
        [
            'the feature belongs to another layer',
            { id: 'a', layerId: 'layer2', zoom: true },
        ],
    ])('returns null when %s', (_, feature) => {
        expect(getZoomTarget(feature, 'layer1')).toBe(null)
    })
})

describe('getFeaturesBounds', () => {
    test('returns the corners around all features', () => {
        expect(
            getFeaturesBounds([
                point([-12, 8]),
                point([-11, 9]),
                point([-10.5, 7.5]),
            ])
        ).toEqual([
            [-12, 7.5],
            [-10.5, 9],
        ])
    })

    test('ignores features without geometry', () => {
        expect(
            getFeaturesBounds([
                { type: 'Feature', geometry: null },
                point([-11, 8]),
            ])
        ).toEqual([
            [-11, 8],
            [-11, 8],
        ])
    })

    test.each([
        ['no features', []],
        ['no feature has a geometry', [{ type: 'Feature', geometry: null }]],
        [
            'geometries without coordinates',
            [
                {
                    type: 'Feature',
                    geometry: { type: 'MultiPolygon', coordinates: [] },
                },
            ],
        ],
    ])('returns null for %s', (_, features) => {
        expect(getFeaturesBounds(features)).toBe(null)
    })
})
