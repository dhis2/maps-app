import {
    assignLines,
    assignPoints,
    clipLine,
    findStart,
    FLAG_GAP,
    FLAG_OVERLAP,
    FLAG_SNAPPED,
    getHalfLengthPoint,
    getLineLength,
    removeNestedOrgUnits,
    withBbox,
} from '../orgUnitAssignment.js'

// Near the equator, 0.001 degree is about 111 m
const square = ([west, south], [east, north]) =>
    withBbox({
        type: 'Polygon',
        coordinates: [
            [
                [west, south],
                [east, south],
                [east, north],
                [west, north],
                [west, south],
            ],
        ],
    })

// The id is the last segment of the path
const orgUnit = (path, geometry, leaf = false) => ({
    id: path.split('/').at(-1),
    name: path.split('/').at(-1),
    path,
    level: path.split('/').length - 1,
    leaf,
    geometry,
})

// A: [0,0]-[2,1], split in A1 and A2 at lng 1. A1 is split again at lng 0.5
// and has a facility point. A2 only has a facility point.
const A = orgUnit('/A', square([0, 0], [2, 1]))
const A1 = orgUnit('/A/A1', square([0, 0], [1, 1]))
const A2 = orgUnit('/A/A2', square([1, 0], [2, 1]))
const A1a = orgUnit('/A/A1/A1a', square([0, 0], [0.5, 1]), true)
const A1b = orgUnit('/A/A1/A1b', square([0.5, 0], [1, 1]), true)
const F1 = orgUnit('/A/A1/F1', { type: 'Point', coordinates: [0.2, 0.2] }, true)
const F2 = orgUnit('/A/A2/F2', { type: 'Point', coordinates: [1.5, 0.2] }, true)

const createLoader = (tree) => {
    const calls = []
    const loadChildren = async (ids) => {
        calls.push(ids)
        return new Map(ids.map((id) => [id, tree[id] ?? []]))
    }
    return { calls, loadChildren }
}

const tree = { A: [A1, A2], A1: [A1a, A1b, F1], A2: [F2] }

const B_LIKE = orgUnit('/B', square([3, 0], [4, 1]))

describe('orgUnitAssignment', () => {
    describe('assignPoints', () => {
        it('goes down to the deepest org unit with a boundary', async () => {
            const { loadChildren } = createLoader(tree)
            const [result] = await assignPoints(
                [{ key: 'p', point: [0.25, 0.5], start: A }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('A1a')
            expect(result.flags).toEqual([])
        })

        it('stops where the children are points', async () => {
            const { loadChildren } = createLoader(tree)
            const [result] = await assignPoints(
                [{ key: 'p', point: [1.5, 0.5], start: A }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('A2')
        })

        it('loads the children of all frontiers once per round', async () => {
            const { calls, loadChildren } = createLoader(tree)
            await assignPoints(
                [
                    { key: 'p1', point: [0.25, 0.5], start: A },
                    { key: 'p2', point: [1.5, 0.5], start: A },
                    { key: 'p3', point: [0.75, 0.5], start: A },
                ],
                loadChildren
            )
            expect(calls).toEqual([['A'], ['A1', 'A2']])
        })

        it('picks the overlapping child the point is deepest in', async () => {
            const B = orgUnit('/B', square([0, 0], [2, 1]))
            const B1 = orgUnit('/B/B1', square([0, 0], [1, 1]), true)
            const B2 = orgUnit('/B/B2', square([0.9, 0], [2, 1]), true)

            for (const children of [
                [B1, B2],
                [B2, B1],
            ]) {
                const { loadChildren } = createLoader({ B: children })
                const [result] = await assignPoints(
                    [{ key: 'p', point: [0.92, 0.5], start: B }],
                    loadChildren
                )
                expect(result.orgUnit.id).toBe('B1')
                expect(result.flags).toEqual([FLAG_OVERLAP])
            }
        })

        it('keeps a stored org unit that still contains the point', async () => {
            const B2 = orgUnit('/B/B2', square([0.9, 0], [2, 1]), true)
            const { loadChildren } = createLoader({})
            const [result] = await assignPoints(
                [{ key: 'p', point: [0.92, 0.5], start: B2 }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('B2')
        })

        it('snaps a point in a sliver to the nearest child within 500 m', async () => {
            const C = orgUnit('/C', square([0, 0], [2, 1]))
            const C1 = orgUnit('/C/C1', square([0, 0], [0.9995, 1]), true)
            const C2 = orgUnit('/C/C2', square([1.001, 0], [2, 1]), true)
            const { loadChildren } = createLoader({ C: [C1, C2] })

            const [result] = await assignPoints(
                [{ key: 'p', point: [1, 0.5], start: C }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('C1')
            expect(result.flags).toEqual([FLAG_SNAPPED])
        })

        it('stays at the parent when the sliver is wider than 500 m', async () => {
            const C = orgUnit('/C', square([0, 0], [2, 1]))
            const C1 = orgUnit('/C/C1', square([0, 0], [0.99, 1]), true)
            const C2 = orgUnit('/C/C2', square([1.01, 0], [2, 1]), true)
            const { loadChildren } = createLoader({ C: [C1, C2] })

            const [result] = await assignPoints(
                [{ key: 'p', point: [1, 0.5], start: C }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('C')
            expect(result.flags).toEqual([FLAG_GAP])
        })

        it('does not snap when a sibling has no boundary', async () => {
            const C = orgUnit('/C', square([0, 0], [2, 1]))
            const C1 = orgUnit('/C/C1', square([0, 0], [0.9995, 1]), true)
            const C3 = orgUnit('/C/C3', null, true)
            const { loadChildren } = createLoader({ C: [C1, C3] })

            const [result] = await assignPoints(
                [{ key: 'p', point: [1, 0.5], start: C }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('C')
            expect(result.flags).toEqual([FLAG_GAP])
        })

        it('looks through a child without boundary that has children', async () => {
            const D = orgUnit('/D', square([0, 0], [2, 1]))
            const H = orgUnit('/D/H', null)
            const H1 = orgUnit('/D/H/H1', square([0, 0], [1, 1]), true)
            const { calls, loadChildren } = createLoader({ D: [H], H: [H1] })

            const [result] = await assignPoints(
                [{ key: 'p', point: [0.5, 0.5], start: D }],
                loadChildren
            )
            expect(result.orgUnit.id).toBe('H1')
            expect(calls).toEqual([['D'], ['H']])
        })
    })

    describe('assignLines', () => {
        it('splits a line per org unit, lengths adding up', async () => {
            const { loadChildren } = createLoader(tree)
            const geometry = {
                type: 'LineString',
                coordinates: [
                    [0.25, 0.5],
                    [1.5, 0.5],
                ],
            }
            const pieces = await assignLines(
                [{ key: 'way/1', geometry, start: A }],
                loadChildren
            )
            expect(pieces.map((p) => p.orgUnit.id).sort()).toEqual([
                'A1a',
                'A1b',
                'A2',
            ])
            const total = pieces.reduce(
                (sum, p) => sum + getLineLength(p.geometry),
                0
            )
            expect(total).toBeCloseTo(getLineLength(geometry), 0)
        })

        it('absorbs short fragments of a line along a boundary', async () => {
            const { loadChildren } = createLoader(tree)
            // Mostly in A2, crossing into A1 for about 20 m
            const geometry = {
                type: 'LineString',
                coordinates: [
                    [1.0002, 0.1],
                    [1.0002, 0.3],
                    [0.9999, 0.30005],
                    [1.0002, 0.3001],
                    [1.0002, 0.6],
                ],
            }
            const pieces = await assignLines(
                [{ key: 'way/2', geometry, start: A }],
                loadChildren
            )
            expect(pieces).toHaveLength(1)
            expect(pieces[0].orgUnit.id).toBe('A2')
            expect(pieces[0].geometry.type).toBe('LineString')
        })

        it('gives one MultiLineString piece to a line leaving and re-entering', async () => {
            const { loadChildren } = createLoader(tree)
            const geometry = {
                type: 'LineString',
                coordinates: [
                    [0.6, 0.5],
                    [1.3, 0.5],
                    [1.3, 0.6],
                    [0.7, 0.6],
                ],
            }
            const pieces = await assignLines(
                [{ key: 'way/3', geometry, start: A }],
                loadChildren
            )
            const byOrgUnit = Object.fromEntries(
                pieces.map((p) => [p.orgUnit.id, p.geometry.type])
            )
            expect(byOrgUnit).toEqual({
                A1b: 'MultiLineString',
                A2: 'LineString',
            })
        })
    })

    it('clips a line to an org unit', () => {
        const clipped = clipLine(
            {
                type: 'LineString',
                coordinates: [
                    [-0.5, 0.5],
                    [0.5, 0.5],
                ],
            },
            A
        )
        expect(clipped.coordinates[0][0]).toBeCloseTo(0, 6)
        expect(clipped.coordinates.at(-1)).toEqual([0.5, 0.5])
    })

    it('keeps the half-length point when vertices are added to one half', () => {
        const before = getHalfLengthPoint({
            type: 'LineString',
            coordinates: [
                [0, 0],
                [2, 0],
            ],
        })
        const after = getHalfLengthPoint({
            type: 'LineString',
            coordinates: [
                [0, 0],
                [0.3, 0],
                [0.6, 0],
                [2, 0],
            ],
        })
        expect(after[0]).toBeCloseTo(before[0], 6)
        expect(after[0]).toBeCloseTo(1, 6)
    })

    it('starts from the first hint containing the point in the user scope', () => {
        const outOfScope = orgUnit('/X', square([0, 0], [2, 1]))
        expect(findStart([0.25, 0.5], [outOfScope, A1, A], ['A'])).toBe(A1)
        expect(findStart([1.5, 0.5], [A1, A], ['A'])).toBe(A)
        expect(findStart([5, 5], [A1, A], ['A'])).toBeUndefined()
    })

    it('drops selected org units inside another selected one', () => {
        expect(
            removeNestedOrgUnits([A1a, A, B_LIKE, A2]).map(({ id }) => id)
        ).toEqual(['A', 'B'])
    })
})
