import {
    assignLines,
    assignPoints,
    containsPoint,
    findStart,
    FLAG_SNAPPED,
    isInScope,
    isPolygon,
    withBbox,
} from '../../util/orgUnitAssignment.js'

// Org units and their children, cached for the session and shared by
// imports, hand-added and moved features. Only branches holding features
// are ever loaded.

const ORG_UNIT_FIELDS = 'id,displayName~rename(name),level,path,leaf,geometry'
const CHUNK_SIZE = 100

const orgUnits = new Map() // id → Promise of org unit or null
const children = new Map() // parent id → Promise of child org units
const loaded = new Map() // id → org unit, once loaded

const toOrgUnit = ({ id, name, level, path, leaf, geometry }) => {
    const orgUnit = {
        id,
        name,
        level,
        path,
        leaf: !!leaf,
        geometry: withBbox(geometry ?? null),
    }
    loaded.set(id, orgUnit)
    return orgUnit
}

const chunk = (list, size) =>
    Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
        list.slice(i * size, (i + 1) * size)
    )

const queryOrgUnits = (engine, filter) =>
    engine
        .query({
            result: {
                resource: 'organisationUnits',
                params: { filter, fields: ORG_UNIT_FIELDS, paging: false },
            },
        })
        .then(({ result }) => result.organisationUnits.map(toOrgUnit))

// One request per chunk of missing keys, failed requests are dropped from
// the cache so they're tried again
const cached = (cache, keys, request) => {
    const missing = [...new Set(keys)].filter((key) => !cache.has(key))

    chunk(missing, CHUNK_SIZE).forEach((chunkKeys) => {
        const response = request(chunkKeys)
        chunkKeys.forEach((key) => {
            const value = response.then((byKey) => byKey.get(key))
            cache.set(key, value)
            value.catch(() => cache.delete(key))
        })
    })

    return Promise.all(keys.map((key) => cache.get(key)))
}

// Resolves to a Map of id → org unit (or null)
export const loadOrgUnits = async (engine, ids) => {
    const list = await cached(orgUnits, ids, async (chunkIds) => {
        const result = await queryOrgUnits(
            engine,
            `id:in:[${chunkIds.join(',')}]`
        )
        return new Map(result.map((orgUnit) => [orgUnit.id, orgUnit]))
    })
    return new Map(ids.map((id, i) => [id, list[i] ?? null]))
}

// Resolves to a Map of parent id → child org units
export const loadChildren = async (engine, parentIds) => {
    const lists = await cached(children, parentIds, async (chunkIds) => {
        const result = await queryOrgUnits(
            engine,
            `parent.id:in:[${chunkIds.join(',')}]`
        )
        const byParent = new Map(chunkIds.map((id) => [id, []]))
        result.forEach((orgUnit) => {
            orgUnits.set(orgUnit.id, Promise.resolve(orgUnit))
            byParent.get(orgUnit.path.split('/').at(-2))?.push(orgUnit)
        })
        return byParent
    })
    return new Map(parentIds.map((id, i) => [id, lists[i] ?? []]))
}

export const getLoadedOrgUnitName = (id) => loaded.get(id)?.name ?? id

const getLoader = (engine) => (ids) => loadChildren(engine, ids)

// Deepest loaded org unit the user can capture for, containing all points
const findDeepestLoaded = (points, rootIds) =>
    [...loaded.values()]
        .filter(
            (orgUnit) =>
                isPolygon(orgUnit.geometry) &&
                isInScope(orgUnit, rootIds) &&
                points.every((point) => containsPoint(orgUnit, point))
        )
        .sort((a, b) => b.level - a.level)[0]

// Roots containing the point first, then roots without a boundary, which may
// contain it too
const getRootStarts = async (engine, point, rootIds) => {
    const roots = [...(await loadOrgUnits(engine, rootIds)).values()].filter(
        Boolean
    )
    return [
        ...roots.filter((root) => containsPoint(root, point)),
        ...roots.filter((root) => !isPolygon(root.geometry)),
    ]
}

/**
 * Org units for the points of an import. Each point starts from its stored
 * org unit when that still contains it, else from its import area, so the
 * result doesn't depend on which areas are imported.
 * points: [{ key, point, areaId, storedOrgUnitId }] → Map key → { orgUnit, flags }
 */
export const assignImportPoints = async (
    engine,
    points,
    { areas, rootIds }
) => {
    const areaById = new Map(areas.map((area) => [area.id, area]))
    const storedIds = points.map((p) => p.storedOrgUnitId).filter(Boolean)
    const stored = await loadOrgUnits(engine, storedIds)

    const results = await assignPoints(
        points.map(({ key, point, areaId, storedOrgUnitId }) => {
            const area = areaById.get(areaId)
            return {
                key,
                point,
                start:
                    findStart(
                        point,
                        [stored.get(storedOrgUnitId), area],
                        rootIds
                    ) ?? area,
            }
        }),
        getLoader(engine)
    )
    return new Map(results.map(({ key, ...result }) => [key, result]))
}

/**
 * Pieces of the clipped lines of an import, one per line and org unit. A
 * line in several areas has a clip per area, each walked from its area.
 * lines: [{ key, geometry, areaId }] → Map key → [{ orgUnit, geometry, flags }]
 */
export const assignImportLines = async (engine, lines, { areas }) => {
    const areaById = new Map(areas.map((area) => [area.id, area]))
    const pieces = await assignLines(
        lines.map(({ key, geometry, areaId }) => ({
            key,
            geometry,
            start: areaById.get(areaId),
        })),
        getLoader(engine)
    )
    const byKey = new Map()
    pieces.forEach(({ key, ...piece }) =>
        byKey.set(key, [...(byKey.get(key) ?? []), piece])
    )
    return byKey
}

const isFound = ({ orgUnit, flags }, point) =>
    containsPoint(orgUnit, point) || flags.includes(FLAG_SNAPPED)

/**
 * Org unit for a single point, e.g. a hand-added or moved facility.
 * hintIds: stored org unit and its ancestors, deepest first, tried in turn.
 * Resolves to { orgUnit, flags }, or null if no boundary contains the point.
 */
export const findOrgUnitForPoint = async (
    engine,
    point,
    { hintIds = [], rootIds }
) => {
    let start
    for (const id of hintIds) {
        const hint = (await loadOrgUnits(engine, [id])).get(id)
        start = findStart(point, [hint], rootIds)
        if (start) {
            break
        }
    }

    const starts = start
        ? [start]
        : [
              findDeepestLoaded([point], rootIds),
              ...(await getRootStarts(engine, point, rootIds)),
          ].filter(Boolean)

    for (const candidate of starts) {
        const [result] = await assignPoints(
            [{ key: 'point', point, start: candidate }],
            getLoader(engine)
        )
        if (isFound(result, point)) {
            return result
        }
    }
    return null
}

/**
 * Pieces of a drawn or reshaped line, one per org unit it crosses. Pieces
 * outside every boundary get orgUnit null, for the user to pick one.
 */
export const splitDrawnLine = async (engine, geometry, { rootIds }) => {
    const vertices =
        geometry.type === 'MultiLineString'
            ? geometry.coordinates.flat()
            : geometry.coordinates

    const start =
        findDeepestLoaded(vertices, rootIds) ??
        (await getRootStarts(engine, vertices[0], rootIds))[0]

    if (!start) {
        return [{ orgUnit: null, geometry, flags: [] }]
    }

    const pieces = await assignLines(
        [{ key: 'line', geometry, start }],
        getLoader(engine)
    )
    return pieces.map(({ orgUnit, ...piece }) => ({
        ...piece,
        orgUnit: isPolygon(orgUnit.geometry) ? orgUnit : null,
    }))
}
