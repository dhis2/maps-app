import { along } from '@turf/along'
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { length } from '@turf/length'
import { lineSplit } from '@turf/line-split'
import { pointToPolygonDistance } from '@turf/point-to-polygon-distance'

// Assigns features to the deepest org unit whose boundary contains them,
// walking down the hierarchy one level per round. Points go to one org unit,
// lines are split into one piece per org unit they cross.

export const SNAP_TOLERANCE_M = 500
export const MIN_FRAGMENT_M = 50
const MAX_ROUNDS = 20

export const FLAG_OVERLAP = 'overlap'
export const FLAG_SNAPPED = 'snapped'
export const FLAG_GAP = 'gap'

const POLYGON_TYPES = new Set(['Polygon', 'MultiPolygon'])
const LINE_STRING = 'LineString'
const MULTI_LINE_STRING = 'MultiLineString'

export const isPolygon = (geometry) => POLYGON_TYPES.has(geometry?.type)

const toFeature = (geometry) => ({ type: 'Feature', geometry, properties: {} })

const lineString = (coordinates) => ({ type: LINE_STRING, coordinates })

const flattenCoordinates = (coords) =>
    typeof coords[0] === 'number'
        ? [coords]
        : coords.flatMap(flattenCoordinates)

// GeoJSON order: west, south, east, north
export const getGeoJsonBbox = (geometry) => {
    const coords = flattenCoordinates(geometry.coordinates)
    const lngs = coords.map(([lng]) => lng)
    const lats = coords.map(([, lat]) => lat)
    return [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
    ]
}

// turf uses the bbox of a polygon to reject points quickly
export const withBbox = (geometry) =>
    isPolygon(geometry) && !geometry.bbox
        ? { ...geometry, bbox: getGeoJsonBbox(geometry) }
        : geometry

const isInBbox = ([lng, lat], [west, south, east, north]) =>
    lng >= west && lng <= east && lat >= south && lat <= north

const bboxesIntersect = (a, b) =>
    a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]

const getBboxOf = (geometry) => geometry.bbox ?? getGeoJsonBbox(geometry)

// Only polygons contain points, the boundary counts as inside
export const containsPoint = (orgUnit, point) =>
    isPolygon(orgUnit?.geometry) &&
    isInBbox(point, getBboxOf(orgUnit.geometry)) &&
    booleanPointInPolygon(point, orgUnit.geometry)

export const isInScope = (orgUnit, rootIds) =>
    rootIds.some((id) => orgUnit.path?.split('/').includes(id))

// Negative inside the polygon
const distanceTo = (point, orgUnit) =>
    pointToPolygonDistance(point, toFeature(orgUnit.geometry), {
        units: 'meters',
    })

const byDistanceThenId = (a, b) =>
    a.distance - b.distance || (a.orgUnit.id < b.orgUnit.id ? -1 : 1)

const withDistances = (point, orgUnits) =>
    orgUnits
        .map((orgUnit) => ({ orgUnit, distance: distanceTo(point, orgUnit) }))
        .sort(byDistanceThenId)

const lineLength = (coordinates) =>
    length(toFeature(lineString(coordinates)), { units: 'meters' })

const getParts = (geometry) =>
    geometry.type === MULTI_LINE_STRING
        ? geometry.coordinates
        : [geometry.coordinates]

export const getLineLength = (geometry) =>
    getParts(geometry).reduce((sum, part) => sum + lineLength(part), 0)

// Point at half the length of the line, or of its longest part
export const getHalfLengthPoint = (geometry) => {
    const [longest] = getParts(geometry)
        .map((coordinates) => ({
            coordinates,
            length: lineLength(coordinates),
        }))
        .sort((a, b) => b.length - a.length)

    return along(
        toFeature(lineString(longest.coordinates)),
        longest.length / 2,
        {
            units: 'meters',
        }
    ).geometry.coordinates
}

/**
 * One step down for a point, among the children of its frontier.
 * canSnap is true when the children are all the children of the org unit the
 * point is in, so a point outside all of them is in a sliver between them.
 * Returns { orgUnit } to go down, { through } to look through children
 * without boundary, or {} to stop, with an optional flag.
 */
export const pointStep = (point, children, canSnap) => {
    const polygons = children.filter((child) => isPolygon(child.geometry))
    const inside = polygons.filter((child) => containsPoint(child, point))

    if (inside.length === 1) {
        return { orgUnit: inside[0] }
    }
    if (inside.length > 1) {
        // Overlap: the one the point is deepest inside
        return {
            orgUnit: withDistances(point, inside)[0].orgUnit,
            flag: FLAG_OVERLAP,
        }
    }

    const hollow = children.filter((child) => !child.geometry && !child.leaf)
    if (hollow.length) {
        return { through: hollow.map(({ id }) => id) }
    }

    // Snap only when no sibling misses a boundary, as the point could be in it
    if (canSnap && polygons.length && children.every((c) => c.geometry)) {
        const [nearest] = withDistances(point, polygons)
        if (nearest.distance <= SNAP_TOLERANCE_M) {
            return { orgUnit: nearest.orgUnit, flag: FLAG_SNAPPED }
        }
    }

    return polygons.length ? { flag: FLAG_GAP } : {}
}

const getFrontier = (orgUnit) => (orgUnit.leaf ? [] : [orgUnit.id])

const applyStep = (item, { orgUnit, through, flag }) => {
    const flags = flag ? [...item.flags, flag] : item.flags

    if (orgUnit) {
        return {
            ...item,
            assigned: orgUnit,
            frontier: getFrontier(orgUnit),
            flags,
        }
    }
    return { ...item, frontier: through ?? [], flags }
}

const getStepKey = ({ orgUnit, through }) => {
    if (orgUnit) {
        return orgUnit.id
    }
    return through ? `through:${through.join()}` : 'stay'
}

const isSameCoordinate = (a, b) => a[0] === b[0] && a[1] === b[1]

// lineSplit doesn't return segments in line order: chain them from the start
const orderSegments = (segments, start) => {
    const remaining = [...segments]
    const ordered = []
    let current = start

    while (remaining.length) {
        const next = remaining.findIndex((s) => isSameCoordinate(s[0], current))
        const [segment] = remaining.splice(Math.max(next, 0), 1)
        ordered.push(segment)
        current = segment.at(-1)
    }
    return ordered
}

const splitAtBoundaries = (coordinates, candidates) =>
    candidates
        .reduce(
            (segments, candidate) =>
                segments.flatMap((segment) => {
                    const { features } = lineSplit(
                        toFeature(lineString(segment)),
                        toFeature(candidate.geometry)
                    )
                    return features.length
                        ? orderSegments(
                              features.map((f) => f.geometry.coordinates),
                              segment[0]
                          )
                        : [segment]
                }),
            [coordinates]
        )
        .filter((segment) => segment.length > 1 && lineLength(segment) > 0)

// Short fragments, often from a line running along a boundary, go with
// their longer neighbour
const absorbFragments = (segments) =>
    segments.map((segment, i) => {
        if (segment.length >= MIN_FRAGMENT_M) {
            return segment
        }
        const neighbours = [segments[i - 1], segments[i + 1]].filter(
            (n) => n && n.length >= MIN_FRAGMENT_M
        )
        if (!neighbours.length) {
            return segment
        }
        neighbours.sort((a, b) => b.length - a.length)
        return { ...segment, step: neighbours[0].step }
    })

// Joins consecutive touching segments going the same way into runs
const mergeRuns = (segments) =>
    segments.reduce((runs, segment) => {
        const last = runs[runs.length - 1]
        if (
            last &&
            getStepKey(last.step) === getStepKey(segment.step) &&
            isSameCoordinate(last.coordinates.at(-1), segment.coordinates[0])
        ) {
            last.coordinates = [
                ...last.coordinates,
                ...segment.coordinates.slice(1),
            ]
        } else {
            runs.push({ ...segment, coordinates: [...segment.coordinates] })
        }
        return runs
    }, [])

/**
 * Splits a line at the boundaries of the children and gives each segment the
 * step of its half-length point. Returns runs: { coordinates, step }.
 */
export const splitLine = (coordinates, children, canSnap) => {
    const bbox = getGeoJsonBbox(lineString(coordinates))
    const candidates = children.filter(
        (child) =>
            isPolygon(child.geometry) &&
            bboxesIntersect(bbox, getBboxOf(child.geometry))
    )
    const segments = splitAtBoundaries(coordinates, candidates).map(
        (segment) => ({
            coordinates: segment,
            length: lineLength(segment),
            step: pointStep(
                getHalfLengthPoint(lineString(segment)),
                children,
                canSnap
            ),
        })
    )

    return mergeRuns(absorbFragments(segments))
}

/**
 * Walks items down one level per round. The children of all frontiers are
 * loaded at once per round: loadChildren(ids) resolves to a Map of parent id
 * to child org units. step(item, children, canSnap) returns the next items.
 */
const walk = (items, loadChildren, step) => {
    const walkRound = async (roundItems, round) => {
        const done = roundItems.filter((item) => !item.frontier.length)
        const active = roundItems.filter((item) => item.frontier.length)

        if (!active.length || round >= MAX_ROUNDS) {
            return roundItems
        }

        const parentIds = [...new Set(active.flatMap((item) => item.frontier))]
        const childrenByParent = await loadChildren(parentIds)

        const next = active.flatMap((item) => {
            const children = item.frontier.flatMap(
                (id) => childrenByParent.get(id) ?? []
            )
            const canSnap =
                item.frontier.length === 1 &&
                item.frontier[0] === item.assigned.id
            return step(item, children, canSnap)
        })

        return [...done, ...(await walkRound(next, round + 1))]
    }

    return walkRound(items, 0)
}

const uniqueFlags = (flags) => [...new Set(flags)]

/**
 * Points: [{ key, point, start }] → [{ key, orgUnit, flags }]
 */
export const assignPoints = async (points, loadChildren) => {
    const items = points.map(({ key, point, start }) => ({
        key,
        point,
        assigned: start,
        frontier: getFrontier(start),
        flags: [],
    }))

    const result = await walk(
        items,
        loadChildren,
        (item, children, canSnap) => [
            applyStep(item, pointStep(item.point, children, canSnap)),
        ]
    )

    return result.map(({ key, assigned, flags }) => ({
        key,
        orgUnit: assigned,
        flags: uniqueFlags(flags),
    }))
}

// Joins the first two parts where one ends where the other starts, or null
const joinFirstPair = (parts) => {
    for (const [i, part] of parts.entries()) {
        const j = parts.findIndex(
            (other, index) =>
                index !== i && isSameCoordinate(part.at(-1), other[0])
        )
        if (j > -1) {
            const rest = parts.filter((_, index) => index !== i && index !== j)
            return [[...part, ...parts[j].slice(1)], ...rest]
        }
    }
    return null
}

// Joins runs where one ends where another starts, in any order
const joinRuns = (runs) => {
    let parts = runs.map((run) => [...run])
    let joined = joinFirstPair(parts)
    while (joined) {
        parts = joined
        joined = joinFirstPair(parts)
    }
    return parts
}

export const toLineGeometry = (parts) =>
    parts.length === 1
        ? lineString(parts[0])
        : { type: MULTI_LINE_STRING, coordinates: parts }

// One LineString or MultiLineString from several, joined where they touch
export const mergeLineGeometries = (geometries) =>
    toLineGeometry(joinRuns(geometries.flatMap(getParts)))

/**
 * Lines: [{ key, geometry, start }] → pieces, one per key and org unit:
 * [{ key, orgUnit, geometry, flags }]
 */
export const assignLines = async (lines, loadChildren) => {
    const items = lines.flatMap(({ key, geometry, start }) =>
        getParts(geometry).map((coordinates) => ({
            key,
            coordinates,
            assigned: start,
            frontier: getFrontier(start),
            flags: [],
        }))
    )

    const result = await walk(items, loadChildren, (item, children, canSnap) =>
        splitLine(item.coordinates, children, canSnap).map(
            ({ coordinates, step }) => applyStep({ ...item, coordinates }, step)
        )
    )

    const pieces = new Map()
    result.forEach(({ key, assigned, coordinates, flags }) => {
        const id = `${key}|${assigned.id}`
        const piece = pieces.get(id) ?? {
            key,
            orgUnit: assigned,
            runs: [],
            flags: [],
        }
        piece.runs.push(coordinates)
        piece.flags.push(...flags)
        pieces.set(id, piece)
    })

    return [...pieces.values()].map(({ key, orgUnit, runs, flags }) => ({
        key,
        orgUnit,
        geometry: toLineGeometry(joinRuns(runs)),
        flags: uniqueFlags(flags),
    }))
}

/**
 * The part of a line inside an org unit, or null. Uses the same splitting,
 * so short fragments along the boundary follow their neighbours.
 */
export const clipLine = (geometry, orgUnit) => {
    const runs = getParts(geometry).flatMap((coordinates) =>
        splitLine(coordinates, [orgUnit], false)
            .filter(({ step }) => step.orgUnit?.id === orgUnit.id)
            .map((run) => run.coordinates)
    )
    return runs.length ? toLineGeometry(joinRuns(runs)) : null
}

/**
 * First hint whose boundary contains the point and that the user can
 * capture data for.
 */
export const findStart = (point, hints, rootIds) =>
    hints.find(
        (orgUnit) =>
            orgUnit &&
            containsPoint(orgUnit, point) &&
            isInScope(orgUnit, rootIds)
    )

// Drops the org units inside another one of the list, as their features
// come with it
export const removeNestedOrgUnits = (orgUnits) =>
    orgUnits.filter(
        (orgUnit) =>
            !orgUnits.some(
                (other) =>
                    other.id !== orgUnit.id &&
                    orgUnit.path.split('/').includes(other.id)
            )
    )
