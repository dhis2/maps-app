import {
    buildSpatialWeights,
    getGiStar,
    getLisa,
} from '../spatialStats.js'
import {
    WEIGHTS_CONTIGUITY,
    WEIGHTS_DISTANCE_BAND,
    WEIGHTS_KNN,
} from '../../constants/layers.js'

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------
//
// Five 1°×1° squares arranged in an L-shape + one isolated island:
//
//   [A][B]
//   [C][D]
//   [E]     [F] ← isolated (no shared border or vertex)
//
// Adjacency (queen):
//   A: B, C, D          (B shares edge, C shares edge, D shares corner)
//   B: A, C, D          (A shares edge, C shares corner, D shares edge)
//   C: A, B, D, E       (shares edges/corners)
//   D: A, B, C, E       (shares edges/corners)
//   E: C, D             (shares edges)
//   F: (none)
//
// Rook (edges only, no diagonal):
//   A: B, C
//   B: A, D
//   C: A, D, E
//   D: B, C, E
//   E: C, D
//   F: (none)

const makeSquare = (id, col, row) => ({
    id,
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [col, row],
                [col + 1, row],
                [col + 1, row + 1],
                [col, row + 1],
                [col, row],
            ],
        ],
    },
    properties: {},
})

const FEATURES = [
    makeSquare('A', 0, 1), // col=0, row=1  → (0,1)-(1,2)
    makeSquare('B', 1, 1), // col=1, row=1  → (1,1)-(2,2)
    makeSquare('C', 0, 0), // col=0, row=0  → (0,0)-(1,1)
    makeSquare('D', 1, 0), // col=1, row=0  → (1,0)-(2,1)
    makeSquare('E', 0, -1), // col=0, row=-1 → (0,-1)-(1,0)
    makeSquare('F', 10, 10), // isolated island far away
]

const VALUES = { A: 10, B: 20, C: 30, D: 40, E: 50, F: 5 }

// ---------------------------------------------------------------------------
// buildSpatialWeights — contiguity
// ---------------------------------------------------------------------------

describe('buildSpatialWeights — queen contiguity', () => {
    let result

    beforeAll(() => {
        result = buildSpatialWeights(FEATURES, { type: WEIGHTS_CONTIGUITY, weightType: 'queen' })
    })

    test('returns neighbors, weights, noNeighborIds', () => {
        expect(result).toHaveProperty('neighbors')
        expect(result).toHaveProperty('weights')
        expect(result).toHaveProperty('noNeighborIds')
    })

    test('F (island) is in noNeighborIds', () => {
        expect(result.noNeighborIds).toContain('F')
    })

    test('no other unit is in noNeighborIds', () => {
        expect(result.noNeighborIds.filter((id) => id !== 'F')).toHaveLength(0)
    })

    test('A has neighbors B, C, D (shares vertex with D)', () => {
        expect(result.neighbors.get('A').sort()).toEqual(['B', 'C', 'D'].sort())
    })

    test('E has neighbors C and D only', () => {
        expect(result.neighbors.get('E').sort()).toEqual(['C', 'D'].sort())
    })

    test('F has empty neighbor array', () => {
        expect(result.neighbors.get('F')).toEqual([])
        expect(result.weights.get('F')).toEqual([])
    })

    test('all rows sum to 1 (row-standardized)', () => {
        for (const [id, w] of result.weights) {
            if (w.length === 0) continue
            const sum = w.reduce((s, v) => s + v, 0)
            expect(sum).toBeCloseTo(1, 10)
        }
    })
})

describe('buildSpatialWeights — rook contiguity', () => {
    let result

    beforeAll(() => {
        result = buildSpatialWeights(FEATURES, { type: WEIGHTS_CONTIGUITY, weightType: 'rook' })
    })

    test('A has rook neighbors B and C (not D — diagonal only)', () => {
        expect(result.neighbors.get('A').sort()).toEqual(['B', 'C'].sort())
    })

    test('B has rook neighbors A and D (not C — diagonal only)', () => {
        expect(result.neighbors.get('B').sort()).toEqual(['A', 'D'].sort())
    })

    test('F still isolated', () => {
        expect(result.noNeighborIds).toContain('F')
    })
})

// ---------------------------------------------------------------------------
// buildSpatialWeights — distance band
// ---------------------------------------------------------------------------

describe('buildSpatialWeights — distance band', () => {
    test('with a large threshold all non-island units see each other', () => {
        const result = buildSpatialWeights(FEATURES, {
            type: WEIGHTS_DISTANCE_BAND,
            distanceMeters: 300_000, // ~300 km, enough to span the 5 squares
        })
        // A, B, C, D, E should all be mutual neighbors; F (10°/10° away) should be isolated
        expect(result.noNeighborIds).toContain('F')
        expect(result.noNeighborIds.filter((id) => id !== 'F')).toHaveLength(0)
    })

    test('with a tiny threshold most units become islands', () => {
        const result = buildSpatialWeights(FEATURES, {
            type: WEIGHTS_DISTANCE_BAND,
            distanceMeters: 1, // 1 metre — nothing qualifies
        })
        expect(result.noNeighborIds).toHaveLength(FEATURES.length)
    })
})

// ---------------------------------------------------------------------------
// buildSpatialWeights — kNN
// ---------------------------------------------------------------------------

describe('buildSpatialWeights — kNN', () => {
    test('k=1 gives exactly one neighbor per unit', () => {
        const result = buildSpatialWeights(FEATURES, { type: WEIGHTS_KNN, k: 1 })
        for (const [, nb] of result.neighbors) {
            expect(nb).toHaveLength(1)
        }
        // kNN always assigns k neighbors so no islands
        expect(result.noNeighborIds).toHaveLength(0)
    })

    test('k=2 gives exactly two neighbors per unit', () => {
        const result = buildSpatialWeights(FEATURES, { type: WEIGHTS_KNN, k: 2 })
        for (const [, nb] of result.neighbors) {
            expect(nb).toHaveLength(2)
        }
    })
})

// ---------------------------------------------------------------------------
// getGiStar
// ---------------------------------------------------------------------------

describe('getGiStar', () => {
    let weights
    let result

    beforeAll(() => {
        // Use queen contiguity on the main 5 squares (exclude F so weights include F as island)
        weights = buildSpatialWeights(FEATURES, { type: WEIGHTS_CONTIGUITY, weightType: 'queen' })
        result = getGiStar(VALUES, weights, { alpha: 0.05, correction: 'none' })
    })

    test('returns a Map with an entry per feature', () => {
        expect(result.size).toBe(FEATURES.length)
    })

    test('each entry has z, p, significant', () => {
        for (const [, v] of result) {
            expect(v).toHaveProperty('z')
            expect(v).toHaveProperty('p')
            expect(v).toHaveProperty('significant')
        }
    })

    test('island F gets z=null, p=null, significant=false', () => {
        expect(result.get('F')).toEqual({ z: null, p: null, significant: false })
    })

    test('E (highest value, neighbors C+D) has positive z', () => {
        // E=50 surrounded by C=30, D=40 — local mean 40 > global mean 30
        expect(result.get('E').z).toBeGreaterThan(0)
    })

    test('A (lowest value, neighbors B+C+D) has negative z', () => {
        // A=10 — local extended-neighborhood mean 25 < global mean 30
        expect(result.get('A').z).toBeLessThan(0)
    })

    test('A.z < E.z (cold spot vs hot spot)', () => {
        expect(result.get('A').z).toBeLessThan(result.get('E').z)
    })

    test('all-same-value edge case: z should be 0 for all units', () => {
        const uniform = { A: 5, B: 5, C: 5, D: 5, E: 5, F: 5 }
        const r = getGiStar(uniform, weights, { correction: 'none' })
        for (const [id, v] of r) {
            if (id === 'F') continue // island, z=null
            expect(v.z).toBeCloseTo(0, 6)
        }
    })

    test('all missing values returns null z for everyone', () => {
        const r = getGiStar({}, weights)
        for (const [, v] of r) {
            expect(v.z).toBeNull()
        }
    })

    test('p-values are in [0, 1]', () => {
        for (const [id, v] of result) {
            if (id === 'F') continue
            expect(v.p).toBeGreaterThanOrEqual(0)
            expect(v.p).toBeLessThanOrEqual(1)
        }
    })
})

// ---------------------------------------------------------------------------
// getLisa
// ---------------------------------------------------------------------------

describe('getLisa', () => {
    let weights
    let result

    beforeAll(() => {
        weights = buildSpatialWeights(FEATURES, { type: WEIGHTS_CONTIGUITY, weightType: 'queen' })
        result = getLisa(VALUES, weights, {
            permutations: 999,
            alpha: 0.05,
            correction: 'none',
            seed: 42,
        })
    })

    test('returns a Map with an entry per feature', () => {
        expect(result.size).toBe(FEATURES.length)
    })

    test('each entry has I, z, pPseudo, cluster, significant', () => {
        for (const [, v] of result) {
            expect(v).toHaveProperty('I')
            expect(v).toHaveProperty('z')
            expect(v).toHaveProperty('pPseudo')
            expect(v).toHaveProperty('cluster')
            expect(v).toHaveProperty('significant')
        }
    })

    test('island F gets null stats and cluster NS', () => {
        expect(result.get('F')).toEqual({
            I: null,
            z: null,
            pPseudo: null,
            cluster: 'NS',
            significant: false,
        })
    })

    test('cluster values are one of HH, LL, HL, LH, NS', () => {
        const valid = new Set(['HH', 'LL', 'HL', 'LH', 'NS'])
        for (const [, v] of result) {
            expect(valid.has(v.cluster)).toBe(true)
        }
    })

    test('non-significant units get cluster NS', () => {
        for (const [, v] of result) {
            if (!v.significant) {
                expect(v.cluster).toBe('NS')
            }
        }
    })

    test('reproducible with the same seed', () => {
        const r2 = getLisa(VALUES, weights, {
            permutations: 999,
            correction: 'none',
            seed: 42,
        })
        for (const [id, v] of result) {
            expect(r2.get(id).pPseudo).toBe(v.pPseudo)
        }
    })

    test('different seed produces different pseudo-p (with high permutations)', () => {
        const r2 = getLisa(VALUES, weights, {
            permutations: 999,
            correction: 'none',
            seed: 99,
        })
        // At least one p-value should differ (extremely unlikely they all match)
        let anyDiffer = false
        for (const [id, v] of result) {
            if (id === 'F') continue
            if (r2.get(id).pPseudo !== v.pPseudo) {
                anyDiffer = true
                break
            }
        }
        expect(anyDiffer).toBe(true)
    })

    test('quadrantScheme geoda and pysal agree on HH and LL', () => {
        const geoda = getLisa(VALUES, weights, { permutations: 99, correction: 'none', seed: 1, quadrantScheme: 'geoda' })
        const pysal = getLisa(VALUES, weights, { permutations: 99, correction: 'none', seed: 1, quadrantScheme: 'pysal' })
        for (const [id] of result) {
            if (id === 'F') continue
            const cg = geoda.get(id).cluster
            const cp = pysal.get(id).cluster
            if (cg === 'HH' || cg === 'LL') {
                expect(cp).toBe(cg) // HH and LL are the same in both schemes
            }
        }
    })

    test('two-sided pseudo-p is in [0, 1]', () => {
        for (const [id, v] of result) {
            if (id === 'F') continue
            expect(v.pPseudo).toBeGreaterThanOrEqual(0)
            expect(v.pPseudo).toBeLessThanOrEqual(1)
        }
    })

    test('all-missing values returns null stats for all', () => {
        const r = getLisa({}, weights)
        for (const [, v] of r) {
            expect(v.I).toBeNull()
        }
    })

    test('FDR correction does not increase any p-value beyond uncorrected', () => {
        const uncorrected = getLisa(VALUES, weights, {
            permutations: 99, seed: 7, correction: 'none',
        })
        const corrected = getLisa(VALUES, weights, {
            permutations: 99, seed: 7, correction: 'fdr',
        })
        for (const [id] of uncorrected) {
            if (id === 'F') continue
            expect(corrected.get(id).pPseudo).toBeGreaterThanOrEqual(
                uncorrected.get(id).pPseudo - 1e-10
            )
        }
    })
})
