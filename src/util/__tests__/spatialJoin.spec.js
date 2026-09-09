import { matchFeaturesToReferenceOrgUnits } from '../spatialJoin.js'

const square = (id, [minX, minY, maxX, maxY]) => ({
    id,
    type: 'Feature',
    properties: { id, name: `Polygon ${id}` },
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [minX, minY],
                [maxX, minY],
                [maxX, maxY],
                [minX, maxY],
                [minX, minY],
            ],
        ],
    },
})

const point = (id, [x, y]) => ({
    id,
    type: 'Feature',
    properties: { id, name: `Point ${id}` },
    geometry: { type: 'Point', coordinates: [x, y] },
})

describe('matchFeaturesToReferenceOrgUnits', () => {
    test('matches a point to the reference org unit whose polygon contains it', () => {
        const features = [point('p1', [1, 1])]
        const referenceOrgUnits = [square('a', [0, 0, 2, 2])]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits)
        ).toEqual([
            { featureProps: { id: 'p1', name: 'Point p1' }, referenceId: 'a' },
        ])
    })

    test('leaves referenceId null for a point outside every reference polygon', () => {
        const features = [point('p1', [10, 10])]
        const referenceOrgUnits = [square('a', [0, 0, 2, 2])]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits)
        ).toEqual([
            { featureProps: { id: 'p1', name: 'Point p1' }, referenceId: null },
        ])
    })

    test('matches each feature independently against multiple reference org units', () => {
        const features = [point('p1', [1, 1]), point('p2', [11, 11])]
        const referenceOrgUnits = [
            square('a', [0, 0, 2, 2]),
            square('b', [10, 10, 12, 12]),
        ]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits)
        ).toEqual([
            { featureProps: { id: 'p1', name: 'Point p1' }, referenceId: 'a' },
            { featureProps: { id: 'p2', name: 'Point p2' }, referenceId: 'b' },
        ])
    })

    test('ignores non-polygon features among the reference org units', () => {
        const features = [point('p1', [1, 1])]
        const referenceOrgUnits = [
            point('notAPolygon', [1, 1]),
            square('a', [0, 0, 2, 2]),
        ]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits)[0]
                .referenceId
        ).toBe('a')
    })

    test('leaves a non-point feature untestable (referenceId null) without useCentroid', () => {
        const features = [square('poly1', [0.5, 0.5, 1.5, 1.5])]
        const referenceOrgUnits = [square('a', [0, 0, 2, 2])]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits)
        ).toEqual([
            {
                featureProps: { id: 'poly1', name: 'Polygon poly1' },
                referenceId: null,
            },
        ])
    })

    test('matches a non-point feature via its centroid when useCentroid is set', () => {
        const features = [square('poly1', [0.5, 0.5, 1.5, 1.5])]
        const referenceOrgUnits = [square('a', [0, 0, 2, 2])]

        expect(
            matchFeaturesToReferenceOrgUnits(features, referenceOrgUnits, {
                useCentroid: true,
            })
        ).toEqual([
            {
                featureProps: { id: 'poly1', name: 'Polygon poly1' },
                referenceId: 'a',
            },
        ])
    })

    test('returns an empty array when there are no features', () => {
        expect(
            matchFeaturesToReferenceOrgUnits([], [square('a', [0, 0, 2, 2])])
        ).toEqual([])
    })
})
