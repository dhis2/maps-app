import { stampFeatureColors } from '../geoJsonUrlLoader.js'

describe('stampFeatureColors', () => {
    it('stamps each feature with its matching geometry-type color', () => {
        const features = [
            { geometry: { type: 'Point' }, properties: { id: '1' } },
            { geometry: { type: 'Polygon' }, properties: { id: '2' } },
        ]
        const legendItemsByType = {
            Point: { color: '#ff0000' },
            Polygon: { color: '#00ff00' },
        }

        const result = stampFeatureColors(features, legendItemsByType)

        expect(result[0].properties.color).toBe('#ff0000')
        expect(result[1].properties.color).toBe('#00ff00')
    })

    it('normalizes Multi* geometry types to their base type before matching', () => {
        const features = [
            { geometry: { type: 'MultiPolygon' }, properties: { id: '1' } },
        ]
        const legendItemsByType = { Polygon: { color: '#00ff00' } }

        const result = stampFeatureColors(features, legendItemsByType)

        expect(result[0].properties.color).toBe('#00ff00')
    })

    it('leaves a feature unchanged when its geometry type has no matching color', () => {
        const features = [
            { geometry: { type: 'LineString' }, properties: { id: '1' } },
        ]

        const result = stampFeatureColors(features, {})

        expect(result[0].properties.color).toBeUndefined()
        expect(result[0]).toEqual(features[0])
    })

    it('does not mutate the original feature objects', () => {
        const features = [
            { geometry: { type: 'Point' }, properties: { id: '1' } },
        ]
        const legendItemsByType = { Point: { color: '#ff0000' } }

        stampFeatureColors(features, legendItemsByType)

        expect(features[0].properties.color).toBeUndefined()
    })

    it('never overwrites a feature that already has its own color', () => {
        const features = [
            {
                geometry: { type: 'Point' },
                properties: { id: '1', color: '#123456' },
            },
        ]
        const legendItemsByType = { Point: { color: '#ff0000' } }

        const result = stampFeatureColors(features, legendItemsByType)

        expect(result[0].properties.color).toBe('#123456')
        expect(result[0]).toBe(features[0])
    })
})
