// Spatial statistics utilities for hotspot and cluster detection.
//
// References:
//   Getis & Ord (1992) doi:10.1111/j.1538-4632.1992.tb00261.x
//   Ord & Getis (1995) doi:10.1111/j.1538-4632.1995.tb00912.x
//   Anselin (1995) doi:10.1111/j.1538-4632.1995.tb00338.x
//   Sokal, Oden & Thomson (1998) — conditional-permutation variance
//   Bivand & Wong (2018) doi:10.1007/s11749-018-0599-x — cross-implementation comparison
import turfCentroid from '@turf/centroid'
import turfDistance from '@turf/distance'
import {
    WEIGHTS_CONTIGUITY,
    WEIGHTS_DISTANCE_BAND,
    WEIGHTS_KNN,
} from '../constants/layers.js'

// ---------------------------------------------------------------------------
// Spatial weights
// ---------------------------------------------------------------------------

/**
 * Build a row-standardized spatial weights matrix from GeoJSON features.
 *
 * @param {Array}  features  GeoJSON Feature array, each with an `id` property.
 * @param {object} opts
 * @param {string} opts.type            WEIGHTS_CONTIGUITY | WEIGHTS_DISTANCE_BAND | WEIGHTS_KNN
 * @param {string} [opts.weightType]    'queen' | 'rook' (contiguity only, default 'queen')
 * @param {number} [opts.distanceMeters] Distance threshold in metres (distance band only)
 * @param {number} [opts.k]             Number of neighbours (kNN only, default 8)
 * @param {boolean} [opts.rowStandardize] Default true
 * @returns {{ neighbors: Map<id, id[]>, weights: Map<id, number[]>, noNeighborIds: id[] }}
 */
export const buildSpatialWeights = (
    features,
    {
        type = WEIGHTS_CONTIGUITY,
        weightType = 'queen',
        distanceMeters,
        k = 8,
        rowStandardize = true,
    } = {}
) => {
    const ids = features.map((f) => f.id)

    let rawNeighbors // Map<id, Set<id>>

    if (type === WEIGHTS_CONTIGUITY) {
        rawNeighbors = buildContiguityNeighbors(features, weightType)
    } else {
        const centroids = computeCentroids(features)
        const distMatrix = computeDistanceMatrix(ids, centroids)
        if (type === WEIGHTS_DISTANCE_BAND) {
            rawNeighbors = buildDistanceBandNeighbors(
                ids,
                distMatrix,
                distanceMeters
            )
        } else if (type === WEIGHTS_KNN) {
            rawNeighbors = buildKnnNeighbors(ids, distMatrix, k)
        }
    }

    const neighbors = new Map()
    const weights = new Map()
    const noNeighborIds = []

    for (const id of ids) {
        const nbSet = rawNeighbors.get(id) ?? new Set()
        const nbArray = [...nbSet]

        if (nbArray.length === 0) {
            noNeighborIds.push(id)
            neighbors.set(id, [])
            weights.set(id, [])
            continue
        }

        neighbors.set(id, nbArray)
        if (rowStandardize) {
            const w = 1 / nbArray.length
            weights.set(
                id,
                nbArray.map(() => w)
            )
        } else {
            weights.set(
                id,
                nbArray.map(() => 1)
            )
        }
    }

    return { neighbors, weights, noNeighborIds }
}

// ---------------------------------------------------------------------------
// Contiguity helpers
// ---------------------------------------------------------------------------

// Returns a canonical string key for an edge (order-independent)
const edgeKey = ([ax, ay], [bx, by]) => {
    const a = `${ax},${ay}`
    const b = `${bx},${by}`
    return a < b ? `${a}|${b}` : `${b}|${a}`
}

// Extract all coordinates from a GeoJSON Polygon or MultiPolygon geometry
const extractRings = (geometry) => {
    if (geometry.type === 'Polygon') {
        return geometry.coordinates
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.flat(1)
    }
    return []
}

const buildContiguityNeighbors = (features, weightType) => {
    const neighbors = new Map(features.map((f) => [f.id, new Set()]))

    // Precompute per-feature coordinate sets and edge sets
    const featureData = features.map((f) => {
        const rings = extractRings(f.geometry)
        const vertexSet = new Set()
        const edgeSet = new Set()

        for (const ring of rings) {
            for (let i = 0; i < ring.length; i++) {
                const [x, y] = ring[i]
                vertexSet.add(`${x},${y}`)
                if (i < ring.length - 1) {
                    edgeSet.add(edgeKey(ring[i], ring[i + 1]))
                }
            }
        }

        return { id: f.id, vertexSet, edgeSet }
    })

    // O(N²) pair comparison — acceptable for typical org-unit counts
    for (let i = 0; i < featureData.length; i++) {
        for (let j = i + 1; j < featureData.length; j++) {
            const a = featureData[i]
            const b = featureData[j]

            let adjacent = false
            if (weightType === 'rook') {
                // Rook: share at least one full edge
                for (const edge of a.edgeSet) {
                    if (b.edgeSet.has(edge)) {
                        adjacent = true
                        break
                    }
                }
            } else {
                // Queen (default): share at least one vertex
                for (const v of a.vertexSet) {
                    if (b.vertexSet.has(v)) {
                        adjacent = true
                        break
                    }
                }
            }

            if (adjacent) {
                neighbors.get(a.id).add(b.id)
                neighbors.get(b.id).add(a.id)
            }
        }
    }

    return neighbors
}

// ---------------------------------------------------------------------------
// Distance-based helpers
// ---------------------------------------------------------------------------

const computeCentroids = (features) => {
    const map = new Map()
    for (const f of features) {
        map.set(f.id, turfCentroid(f).geometry.coordinates) // [lng, lat]
    }
    return map
}

// Returns Map<id, Map<id, distKm>>
const computeDistanceMatrix = (ids, centroids) => {
    const matrix = new Map()
    for (let i = 0; i < ids.length; i++) {
        const row = new Map()
        for (let j = 0; j < ids.length; j++) {
            if (i === j) {
                row.set(ids[j], 0)
                continue
            }
            // @turf/distance returns km; convert to metres for callers
            const from = {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: centroids.get(ids[i]) },
            }
            const to = {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: centroids.get(ids[j]) },
            }
            row.set(ids[j], turfDistance(from, to) * 1000)
        }
        matrix.set(ids[i], row)
    }
    return matrix
}

const buildDistanceBandNeighbors = (ids, distMatrix, threshold) => {
    const neighbors = new Map(ids.map((id) => [id, new Set()]))
    for (let i = 0; i < ids.length; i++) {
        for (let j = 0; j < ids.length; j++) {
            if (i === j) {
                continue
            }
            if (distMatrix.get(ids[i]).get(ids[j]) <= threshold) {
                neighbors.get(ids[i]).add(ids[j])
            }
        }
    }
    return neighbors
}

const buildKnnNeighbors = (ids, distMatrix, k) => {
    const neighbors = new Map()
    for (const id of ids) {
        const sorted = ids
            .filter((other) => other !== id)
            .sort(
                (a, b) => distMatrix.get(id).get(a) - distMatrix.get(id).get(b)
            )
        neighbors.set(id, new Set(sorted.slice(0, k)))
    }
    return neighbors
}

// ---------------------------------------------------------------------------
// Seedable RNG — mulberry32 (Vigna 2017)
// ---------------------------------------------------------------------------

// Produces a seeded PRNG function that returns floats in [0, 1).
// Used for LISA conditional permutations to ensure reproducibility.
const mulberry32 = (seed) => {
    let s = seed >>> 0
    return () => {
        s += 0x6d2b79f5
        let t = Math.imul(s ^ (s >>> 15), 1 | s)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Fisher-Yates shuffle using a supplied RNG
const shuffle = (array, rng) => {
    const a = array.slice()
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// ---------------------------------------------------------------------------
// Multiple-comparison correction
// ---------------------------------------------------------------------------

/**
 * Apply Benjamini-Hochberg FDR correction.
 * Returns an array of adjusted p-values (same order as input).
 */
const bhFdr = (pValues) => {
    const n = pValues.length
    const indexed = pValues.map((p, i) => ({ p, i }))
    indexed.sort((a, b) => b.p - a.p) // descending

    const adjusted = new Array(n)
    let minSoFar = 1
    for (let rank = 0; rank < n; rank++) {
        const { p, i } = indexed[rank]
        const adj = Math.min(1, (p * n) / (n - rank))
        minSoFar = Math.min(minSoFar, adj)
        adjusted[i] = minSoFar
    }
    return adjusted
}

/**
 * Apply Bonferroni correction.
 * Returns an array of adjusted p-values (same order as input).
 */
const bonferroni = (pValues) =>
    pValues.map((p) => Math.min(1, p * pValues.length))

const applyCorrection = (pValues, correction) => {
    if (correction === 'fdr') {
        return bhFdr(pValues)
    }
    if (correction === 'bonferroni') {
        return bonferroni(pValues)
    }
    return pValues
}

// ---------------------------------------------------------------------------
// Normal distribution helpers
// ---------------------------------------------------------------------------

// Abramowitz & Stegun approximation for the standard normal CDF
const normalCdf = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const poly =
        t *
        (0.31938153 +
            t *
                (-0.356563782 +
                    t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
    const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly
    return z >= 0 ? p : 1 - p
}

// Two-sided p from a z-score
const twoSidedP = (z) => 2 * (1 - normalCdf(Math.abs(z)))

// Confidence-tier classification for a Gi* result, matching the conventional
// "Hot Spot Analysis" labeling (90/95/99% confidence). Driven by the
// corrected p-value (not raw z) so it stays correct under FDR/Bonferroni,
// and gated by the chosen alpha so only reachable tiers are ever produced
// (e.g. alpha=0.01 can only ever yield a 99%-confidence tier).
const getGiTier = (z, p, alpha) => {
    if (p >= alpha) {
        return 'ns'
    }
    const sign = z >= 0 ? 'hot' : 'cold'
    if (p < 0.01) {
        return `${sign}99`
    }
    if (p < 0.05) {
        return `${sign}95`
    }
    return `${sign}90`
}

// ---------------------------------------------------------------------------
// Getis-Ord Gi*
// ---------------------------------------------------------------------------

/**
 * Compute Getis-Ord Gi* for each feature.
 *
 * Gi* is the "star" variant — it includes the focal unit i in its own
 * neighbor set (unlike Gi which excludes it).
 *
 * @param {Map<id, number>} valueById
 * @param {{ neighbors: Map, weights: Map, noNeighborIds: id[] }} spatialWeights
 * @param {object} [opts]
 * @param {number} [opts.alpha=0.05]
 * @param {string} [opts.correction='fdr']  'fdr' | 'bonferroni' | 'none'
 * @returns {Map<id, { z: number|null, p: number|null, significant: boolean, tier: string|null }>}
 *   `tier` is one of 'cold99'|'cold95'|'cold90'|'ns'|'hot90'|'hot95'|'hot99', or
 *   null for units with no computed statistic (no neighbors / no value).
 */
export const getGiStar = (
    valueById,
    { neighbors, noNeighborIds },
    { alpha = 0.05, correction = 'fdr' } = {}
) => {
    const ids = [...neighbors.keys()]
    const noNeighborSet = new Set(noNeighborIds)

    // Units with no value are excluded from the global mean/variance
    const values = ids
        .filter(
            (id) =>
                !noNeighborSet.has(id) &&
                valueById[id] !== undefined &&
                !Number.isNaN(valueById[id])
        )
        .map((id) => valueById[id])

    if (values.length === 0) {
        const result = new Map()
        for (const id of ids) {
            result.set(id, { z: null, p: null, significant: false, tier: null })
        }
        return result
    }

    const n = values.length
    const xBar = values.reduce((s, v) => s + v, 0) / n
    const s = Math.sqrt(values.reduce((s, v) => s + (v - xBar) ** 2, 0) / n)

    // Ord & Getis (1995) Gi* formula
    // Gi* = (Σⱼ wᵢⱼ* xⱼ - xBar Σⱼ wᵢⱼ*) / (s * sqrt((n Σⱼ wᵢⱼ*² - (Σⱼ wᵢⱼ*)²) / (n-1)))
    // where wᵢⱼ* includes self (wᵢᵢ* = 1 before row-standardization, then re-standardized)
    //
    // Because the weights object was built WITHOUT self, we add self here temporarily.
    // We re-standardize the extended row so the formula is invariant to the original
    // row-standardization of the neighbors-only weights.

    const rawZscores = []
    const rawPvalues = []
    const computedIds = []

    for (const id of ids) {
        if (
            noNeighborSet.has(id) ||
            valueById[id] === undefined ||
            Number.isNaN(valueById[id])
        ) {
            continue
        }

        const nb = neighbors.get(id)
        // Gi* extended neighbor set: original neighbors + self
        const extNb = [...nb, id]
        const wStar = 1 / extNb.length // row-standardize including self

        let wStarSum = 0
        let wStarSumXj = 0
        let wStarSumSq = 0

        for (const nbId of extNb) {
            const xj = valueById[nbId]
            if (xj === undefined || Number.isNaN(xj)) {
                continue
            }
            wStarSum += wStar
            wStarSumXj += wStar * xj
            wStarSumSq += wStar * wStar
        }

        const numerator = wStarSumXj - xBar * wStarSum
        const denominator =
            s * Math.sqrt((n * wStarSumSq - wStarSum * wStarSum) / (n - 1))

        const z = denominator === 0 ? 0 : numerator / denominator
        const p = twoSidedP(z)

        rawZscores.push(z)
        rawPvalues.push(p)
        computedIds.push(id)
    }

    const adjustedP = applyCorrection(rawPvalues, correction)

    const result = new Map()

    // No-neighbor and no-value units
    for (const id of ids) {
        if (!computedIds.includes(id)) {
            result.set(id, { z: null, p: null, significant: false, tier: null })
        }
    }

    for (let i = 0; i < computedIds.length; i++) {
        const z = rawZscores[i]
        const p = adjustedP[i]
        result.set(computedIds[i], {
            z,
            p,
            significant: p < alpha,
            tier: getGiTier(z, p, alpha),
        })
    }

    return result
}

// ---------------------------------------------------------------------------
// Local Moran's I (LISA)
// ---------------------------------------------------------------------------

/**
 * Compute Local Moran's I (LISA) for each feature.
 *
 * Uses conditional permutation for pseudo-p values. Self is EXCLUDED from the
 * permutation pool (following PySAL esda convention; see esda issue #86).
 *
 * @param {Map<id, number>} valueById
 * @param {{ neighbors: Map, weights: Map, noNeighborIds: id[] }} spatialWeights
 * @param {object} [opts]
 * @param {number} [opts.permutations=999]
 * @param {number} [opts.alpha=0.05]
 * @param {string} [opts.correction='fdr']  'fdr' | 'bonferroni' | 'none'
 * @param {number} [opts.seed=42]
 * @param {string} [opts.quadrantScheme='geoda']  'geoda' | 'pysal'
 * @returns {Map<id, { I: number|null, z: number|null, pPseudo: number|null, cluster: string, significant: boolean }>}
 */
export const getLisa = (
    valueById,
    { neighbors, weights, noNeighborIds },
    {
        permutations = 999,
        alpha = 0.05,
        correction = 'fdr',
        seed = 42,
        quadrantScheme = 'geoda',
    } = {}
) => {
    const ids = [...neighbors.keys()]
    const noNeighborSet = new Set(noNeighborIds)

    // Units with values (excludes no-neighbor and missing)
    const validIds = ids.filter(
        (id) =>
            !noNeighborSet.has(id) &&
            valueById[id] !== undefined &&
            !Number.isNaN(valueById[id])
    )

    if (validIds.length === 0) {
        const result = new Map()
        for (const id of ids) {
            result.set(id, {
                I: null,
                z: null,
                pPseudo: null,
                cluster: 'NS',
                significant: false,
            })
        }
        return result
    }

    // Z-standardize values
    const mean =
        validIds.reduce((s, id) => s + valueById[id], 0) / validIds.length
    const variance =
        validIds.reduce((s, id) => s + (valueById[id] - mean) ** 2, 0) /
        validIds.length
    const std = Math.sqrt(variance)

    const zById = new Map()
    for (const id of validIds) {
        zById.set(id, std === 0 ? 0 : (valueById[id] - mean) / std)
    }

    // Compute observed Local Moran's I for each unit
    const observedI = new Map()
    for (const id of validIds) {
        const zi = zById.get(id)
        const nb = neighbors.get(id)
        const wRow = weights.get(id)
        let lag = 0
        for (let j = 0; j < nb.length; j++) {
            const zj = zById.get(nb[j])
            if (zj !== undefined) {
                lag += wRow[j] * zj
            }
        }
        observedI.set(id, zi * lag)
    }

    // Conditional permutation: for each unit i, hold zᵢ fixed and permute the
    // remaining N-1 z-values (excluding i) across all other positions, then
    // recompute the spatial lag for i's neighbors.
    const rng = mulberry32(seed)
    const otherIdsPool = validIds // permutation draws from all valid ids

    const pseudoPvalues = new Map()

    for (const id of validIds) {
        const zi = zById.get(id)
        const nb = neighbors.get(id)
        const wRow = weights.get(id)
        const observed = observedI.get(id)

        // Pool excludes self — this is the key correctness requirement
        const pool = otherIdsPool
            .filter((other) => other !== id)
            .map((other) => zById.get(other))

        let countMore = 0
        let countLess = 0

        for (let p = 0; p < permutations; p++) {
            const permuted = shuffle(pool, rng)
            let permLag = 0
            for (let j = 0; j < nb.length; j++) {
                const permZ = permuted[j] ?? 0
                permLag += wRow[j] * permZ
            }
            const permI = zi * permLag
            if (permI >= observed) {
                countMore++
            }
            if (permI <= observed) {
                countLess++
            }
        }

        // Two-sided pseudo-p: fold both tails, cap at 1.
        // Following esda convention: p = 2 * min(count_above, count_below) / permutations,
        // capped at 1 because the two-sided fold can otherwise exceed 1 for units near
        // the center of the permutation distribution.
        const pOneSided = Math.min(countMore, countLess) / permutations
        pseudoPvalues.set(id, Math.min(1, 2 * pOneSided))
    }

    // Apply multiple-comparison correction
    const pArr = validIds.map((id) => pseudoPvalues.get(id))
    const adjustedArr = applyCorrection(pArr, correction)
    const adjustedP = new Map(validIds.map((id, i) => [id, adjustedArr[i]]))

    // Derive cluster quadrant
    const getCluster = (id, significant) => {
        if (!significant) {
            return 'NS'
        }
        const zi = zById.get(id)
        const nb = neighbors.get(id)
        const wRow = weights.get(id)
        let lag = 0
        for (let j = 0; j < nb.length; j++) {
            const zj = zById.get(nb[j])
            if (zj !== undefined) {
                lag += wRow[j] * zj
            }
        }
        // GeoDa: HH=1, LL=2, LH=3, HL=4
        // PySAL: HH=1, LH=2, LL=3, HL=4
        // Both label high-high and low-low the same; differ on LH vs HL numbering only.
        // We use descriptive strings so the scheme only affects the label order in the legend.
        if (zi > 0 && lag > 0) {
            return 'HH'
        }
        if (zi < 0 && lag < 0) {
            return 'LL'
        }
        if (quadrantScheme === 'pysal') {
            if (zi > 0 && lag < 0) {
                return 'HL'
            }
            return 'LH'
        }
        // GeoDa (default)
        if (zi < 0 && lag > 0) {
            return 'LH'
        }
        return 'HL'
    }

    const result = new Map()

    // No-neighbor and missing-value units
    for (const id of ids) {
        if (!validIds.includes(id)) {
            result.set(id, {
                I: null,
                z: null,
                pPseudo: null,
                cluster: 'NS',
                significant: false,
            })
        }
    }

    for (const id of validIds) {
        const adj = adjustedP.get(id)
        const significant = adj < alpha
        result.set(id, {
            I: observedI.get(id),
            z: zById.get(id),
            pPseudo: adj,
            cluster: getCluster(id, significant),
            significant,
        })
    }

    return result
}
