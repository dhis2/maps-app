import { DURATION_DEFAULT, PADDING_DEFAULT } from '../../constants/layers.js'
import { fitFeatures, getFeaturesBounds } from '../fit.js'

const point = (coordinates) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {},
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

describe('fitFeatures', () => {
    const createMap = () => ({ fitBounds: jest.fn() })

    test('fits one feature, at most to zoom level 17', () => {
        const map = createMap()
        fitFeatures(map, [point([-11, 8])])
        expect(map.fitBounds).toHaveBeenCalledWith(
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

    test('fits the box around several features', () => {
        const map = createMap()
        fitFeatures(map, [
            point([-12, 8]),
            point([-11, 9]),
            point([-10.5, 7.5]),
        ])
        expect(map.fitBounds).toHaveBeenCalledWith(
            [
                [-12, 7.5],
                [-10.5, 9],
            ],
            expect.objectContaining({ maxZoom: 17 })
        )
    })

    test('skips features without geometry', () => {
        const map = createMap()
        fitFeatures(map, [{ type: 'Feature', geometry: null }, point([-11, 8])])
        expect(map.fitBounds).toHaveBeenCalledWith(
            [
                [-11, 8],
                [-11, 8],
            ],
            expect.anything()
        )
    })

    test.each([
        ['there are no features', []],
        ['no feature has a geometry', [{ type: 'Feature', geometry: null }]],
        [
            'the features have no coordinates',
            [
                {
                    type: 'Feature',
                    geometry: { type: 'MultiPolygon', coordinates: [] },
                },
            ],
        ],
    ])('does not move the map when %s', (_, features) => {
        const map = createMap()
        fitFeatures(map, features)
        expect(map.fitBounds).not.toHaveBeenCalled()
    })
})
