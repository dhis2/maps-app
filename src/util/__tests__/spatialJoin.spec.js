import { spatialJoin } from '../spatialJoin.js'

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

describe('spatialJoin', () => {
    test('matches a point to the polygon that contains it', () => {
        const pointLayer = { data: [point('p1', [1, 1])] }
        const polygonLayer = { data: [square('a', [0, 0, 2, 2])] }

        const result = spatialJoin(pointLayer, polygonLayer)

        expect(result).toEqual([
            {
                pointProps: { id: 'p1', name: 'Point p1' },
                polygonProps: { id: 'a', name: 'Polygon a' },
            },
        ])
    })

    test('leaves polygonProps null for a point outside every polygon', () => {
        const pointLayer = { data: [point('p1', [10, 10])] }
        const polygonLayer = { data: [square('a', [0, 0, 2, 2])] }

        const result = spatialJoin(pointLayer, polygonLayer)

        expect(result).toEqual([
            {
                pointProps: { id: 'p1', name: 'Point p1' },
                polygonProps: null,
            },
        ])
    })

    test('matches each point independently against multiple polygons', () => {
        const pointLayer = {
            data: [point('p1', [1, 1]), point('p2', [11, 11])],
        }
        const polygonLayer = {
            data: [square('a', [0, 0, 2, 2]), square('b', [10, 10, 12, 12])],
        }

        const result = spatialJoin(pointLayer, polygonLayer)

        expect(result).toEqual([
            {
                pointProps: { id: 'p1', name: 'Point p1' },
                polygonProps: { id: 'a', name: 'Polygon a' },
            },
            {
                pointProps: { id: 'p2', name: 'Point p2' },
                polygonProps: { id: 'b', name: 'Polygon b' },
            },
        ])
    })

    test('ignores non-polygon features in the polygon layer', () => {
        const pointLayer = { data: [point('p1', [1, 1])] }
        const polygonLayer = {
            data: [
                { geometry: { type: 'Point', coordinates: [1, 1] } },
                square('a', [0, 0, 2, 2]),
            ],
        }

        const result = spatialJoin(pointLayer, polygonLayer)

        expect(result[0].polygonProps).toEqual({ id: 'a', name: 'Polygon a' })
    })

    test('returns an empty array when the point layer has no data', () => {
        expect(
            spatialJoin({ data: [] }, { data: [square('a', [0, 0, 2, 2])] })
        ).toEqual([])
    })

    test('tolerates a missing data array on either layer', () => {
        expect(spatialJoin({}, {})).toEqual([])
    })
})
