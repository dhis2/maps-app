import { OSM_DATA_ELEMENTS as DE } from '../components/osmImport/osmMetadata.js'
import { GEO_TYPE_LINE, GEO_TYPE_POINT } from './geojson.js'
import {
    clipLine,
    containsPoint,
    getHalfLengthPoint,
    getLineLength,
    mergeLineGeometries,
} from './orgUnitAssignment.js'
import {
    findTag,
    formatTag,
    getOverpassFilters,
    OSM_GEOMETRY_LINE,
} from './osmCategories.js'
import { generateUid } from './uid.js'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export const OSM_STATUS_NEW = 'new'
export const OSM_STATUS_CHANGED = 'changed'
export const OSM_STATUS_UNCHANGED = 'unchanged'
export const OSM_STATUS_CONFLICT = 'conflict'
export const OSM_STATUS_REASSIGNED = 'reassigned'
export const OSM_STATUS_REMOVED = 'removed'

const LOCAL_KEY_PREFIX = 'local/'

const round = (n) => Math.round(n * 1e6) / 1e6

const roundCoordinates = (coords) =>
    typeof coords[0] === 'number'
        ? coords.map(round)
        : coords.map(roundCoordinates)

const roundGeometry = (geometry) => ({
    type: geometry.type,
    coordinates: roundCoordinates(geometry.coordinates),
})

const flattenCoordinates = (coords) =>
    typeof coords[0] === 'number'
        ? [coords]
        : coords.flatMap(flattenCoordinates)

// Overpass bbox order: south, west, north, east
export const getBbox = (geometry) => {
    const coords = flattenCoordinates(geometry.coordinates)
    const lngs = coords.map(([lng]) => lng)
    const lats = coords.map(([, lat]) => lat)
    return [
        Math.min(...lats),
        Math.min(...lngs),
        Math.max(...lats),
        Math.max(...lngs),
    ]
}

// The filters for each bbox, e.g. nwr["amenity"~"^(school)$"](s,w,n,e);
const getStatements = (filters, bboxes) =>
    filters.flatMap((filter) =>
        bboxes.map((bbox) => `${filter}(${bbox.join(',')});`)
    )

// Features of the selected subcategories in the bboxes of the areas
export const buildOverpassQuery = (category, bboxes, subcategoryIds) => {
    const output = category.geometry === OSM_GEOMETRY_LINE ? 'geom' : 'center'
    const filters = getOverpassFilters(category, subcategoryIds)

    return `[out:json][timeout:180];
(
${getStatements(filters, bboxes)
    .map((statement) => `  ${statement}`)
    .join('\n')}
);
out meta ${output};`
}

// One count per subcategory, in the same order. A feature in several
// bboxes is counted once.
export const buildOverpassCountQuery = (category, bboxes, subcategoryIds) => {
    const counts = subcategoryIds.map((id) => {
        const filters = getOverpassFilters(category, [id])
        return `(${getStatements(filters, bboxes).join('')});out count;`
    })
    return `[out:json][timeout:180];\n${counts.join('\n')}`
}

// Counts from a count query: Map of subcategory id → number of features
export const getSubcategoryCounts = (elements, subcategoryIds) => {
    const counts = elements.filter(({ type }) => type === 'count')
    return new Map(
        subcategoryIds.map((id, i) => [id, Number(counts[i]?.tags?.total ?? 0)])
    )
}

// A timeout or memory error can come with partial data and a remark. Missing
// features would then be taken as removed from OSM, so it's an error.
export const getOverpassElements = ({ elements = [], remark }) => {
    if (remark && /runtime error/i.test(remark)) {
        throw new Error(`Overpass did not return all data: ${remark}`)
    }
    return elements
}

export const fetchOsmElements = async (query) => {
    const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
    })

    if (!response.ok) {
        throw new Error(`Overpass request failed (${response.status})`)
    }

    return getOverpassElements(await response.json())
}

/**
 * The point, line and length stored on an event for a geometry. A line's
 * point is at half its length, so it doesn't move when vertices are added to
 * one half.
 */
export const getGeometryParts = (geometry) => {
    if (geometry.type === GEO_TYPE_POINT) {
        return { point: roundCoordinates(geometry.coordinates) }
    }
    const line = roundGeometry(geometry)
    return {
        line,
        point: roundCoordinates(getHalfLengthPoint(line)),
        length: Math.round(getLineLength(line)),
    }
}

const getElementGeometry = ({ type, lon, lat, center, geometry }, category) => {
    if (category.geometry === OSM_GEOMETRY_LINE) {
        return geometry?.length > 1
            ? {
                  type: GEO_TYPE_LINE,
                  coordinates: geometry.map(({ lon, lat }) => [lon, lat]),
              }
            : null
    }
    if (type === 'node') {
        return { type: GEO_TYPE_POINT, coordinates: [lon, lat] }
    }
    return center
        ? { type: GEO_TYPE_POINT, coordinates: [center.lon, center.lat] }
        : null
}

// One OSM element to a flat feature, with the tag that puts it in the
// category, e.g. amenity=school in the schools subcategory
export const parseOsmElement = (element, category, subcategoryIds) => {
    const { type, id, tags = {}, version, timestamp, user } = element
    const geometry = getElementGeometry(element, category)
    const tag = findTag(category, tags, subcategoryIds)

    return {
        osmId: `${type}/${id}`,
        name: tags.name ?? '',
        type: tag?.value ?? '',
        tag: tag && formatTag(tag),
        subcategory: tag?.subcategory,
        surface: tags.surface,
        version,
        lastEdited: timestamp,
        editedBy: user,
        ...(geometry && getGeometryParts(geometry)),
    }
}

export const parseOsmElements = (elements, category, subcategoryIds) =>
    elements
        .map((element) => parseOsmElement(element, category, subcategoryIds))
        .filter(({ point, tag }) => point && tag)

/**
 * Keeps the features inside the import areas. A point goes with the first
 * area containing it. A line keeps its part in each area, as clips: the
 * rest comes with the import of the neighbouring areas.
 */
export const clipToAreas = (features, areas) =>
    features.flatMap((feature) => {
        if (!feature.line) {
            const area = areas.find((a) => containsPoint(a, feature.point))
            return area ? [{ ...feature, areaId: area.id }] : []
        }
        const clips = areas.flatMap((area) => {
            const line = clipLine(feature.line, area)
            return line ? [{ areaId: area.id, line }] : []
        })
        return clips.length ? [{ ...feature, clips }] : []
    })

// A feature added in DHIS2, with no OSM id or version, so imports leave it
// alone and a later export can find it
export const createManualFeature = ({
    geometry,
    name,
    type,
    tag,
    subcategory,
    surface,
    username,
}) => ({
    featureKey: `${LOCAL_KEY_PREFIX}${generateUid()}`,
    name,
    type,
    tag,
    subcategory,
    surface,
    lastEdited: new Date().toISOString(),
    editedBy: username,
    ...getGeometryParts(geometry),
})

export const getDataValue = (event, dataElement) =>
    event.dataValues?.find((dv) => dv.dataElement === dataElement)?.value

const isLocallyEdited = (event) =>
    getDataValue(event, DE.locallyEdited) === 'true'

const getVersion = (event) => Number(getDataValue(event, DE.version)) || 0

// Health facilities and roads have their own type data element
const getType = (event) =>
    getDataValue(event, DE.facilityType) ??
    getDataValue(event, DE.roadClass) ??
    getDataValue(event, DE.type)

// A stored event back to a feature, to edit it
export const eventToFeature = (event) => {
    const line = getDataValue(event, DE.lineGeometry)
    const version = getDataValue(event, DE.version)
    const length = getDataValue(event, DE.length)
    const osmId = getDataValue(event, DE.id)

    return {
        eventId: event.event,
        orgUnit: event.orgUnit,
        osmId,
        // Events from before the feature key use their OSM id
        featureKey: getDataValue(event, DE.featureKey) ?? osmId,
        version: version ? Number(version) : undefined,
        name: getDataValue(event, DE.name) ?? '',
        type: getType(event),
        tag: getDataValue(event, DE.tag),
        subcategory: getDataValue(event, DE.subcategory),
        surface: getDataValue(event, DE.roadSurface),
        lastEdited: getDataValue(event, DE.lastEdited),
        editedBy: getDataValue(event, DE.editedBy),
        locallyEdited: isLocallyEdited(event),
        point: event.geometry?.coordinates,
        line: line ? JSON.parse(line) : undefined,
        length: length ? Number(length) : undefined,
    }
}

// Imported features keep their OSM id and version, and are flagged as
// locally edited so re-imports don't overwrite the edit
export const editFeature = (
    feature,
    {
        name = feature.name,
        type = feature.type,
        tag = feature.tag,
        subcategory = feature.subcategory,
        surface = feature.surface,
        geometry,
        username,
    }
) => ({
    ...feature,
    ...(geometry && getGeometryParts(geometry)),
    name,
    type,
    tag,
    subcategory,
    surface,
    editedBy: username,
    lastEdited: new Date().toISOString(),
    locallyEdited: !!feature.osmId,
})

export const toTrackerEvent = (feature, category, orgUnit) => {
    const { program } = category
    const values = {
        [DE.id]: feature.osmId,
        [DE.featureKey]: feature.featureKey ?? feature.osmId,
        [DE.name]: feature.name,
        [DE.version]: feature.version,
        [DE.lastEdited]: feature.lastEdited,
        [DE.editedBy]: feature.editedBy,
        [DE.locallyEdited]: feature.locallyEdited ? 'true' : undefined,
        [category.typeDataElement]: feature.type,
        [DE.tag]: feature.tag,
        [DE.subcategory]: feature.subcategory,
    }

    if (feature.line) {
        values[DE.roadSurface] = feature.surface
        values[DE.lineGeometry] = JSON.stringify(feature.line)
        values[DE.length] = feature.length
    }

    return {
        event: feature.eventId ?? generateUid(),
        program: program.id,
        programStage: program.programStage,
        orgUnit,
        occurredAt: feature.lastEdited,
        status: 'COMPLETED',
        geometry: { type: GEO_TYPE_POINT, coordinates: feature.point },
        dataValues: Object.entries(values)
            .filter(([, value]) => value !== undefined && value !== '')
            .map(([dataElement, value]) => ({
                dataElement,
                value: String(value),
            })),
    }
}

const byPrimary = (a, b) =>
    Number(isLocallyEdited(b)) - Number(isLocallyEdited(a)) ||
    getVersion(b) - getVersion(a) ||
    String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')) ||
    (a.event < b.event ? -1 : 1)

// The event to keep when several stand for the same feature, and the rest
export const splitPrimary = (events) => {
    const [primary, ...rest] = [...events].sort(byPrimary)
    return { primary, rest }
}

const groupBy = (list, getKey) =>
    list.reduce((map, item) => {
        const key = getKey(item)
        return map.set(key, [...(map.get(key) ?? []), item])
    }, new Map())

const uniqueEvents = (events) => [
    ...new Map(events.map((event) => [event.event, event])).values(),
]

const ids = (events) => events.map(({ event }) => event)

const getStoredRow = (events, getOrgUnitName) => {
    const event = events[0]
    return {
        key: getDataValue(event, DE.id),
        osmId: getDataValue(event, DE.id),
        name: getDataValue(event, DE.name) ?? '',
        type: getType(event),
        editedBy: getDataValue(event, DE.editedBy),
        orgUnits: [...new Set(events.map((e) => e.orgUnit))].map((id) => ({
            id,
            name: getOrgUnitName(id),
        })),
        flags: [],
    }
}

const getRow = (feature, orgUnits, flags = []) => ({
    key: feature.osmId,
    osmId: feature.osmId,
    name: feature.name,
    type: feature.type,
    editedBy: feature.editedBy,
    orgUnits: orgUnits.map(({ id, name }) => ({ id, name })),
    flags,
})

const comparePoint = ({ feature, matches, category, getOrgUnitName }) => {
    const row = getRow(feature, [feature.orgUnit], feature.flags)
    const orgUnit = feature.orgUnit.id

    if (!matches.length) {
        const event = toTrackerEvent(
            { ...feature, featureKey: feature.osmId, eventId: generateUid() },
            category,
            orgUnit
        )
        return { row: { ...row, status: OSM_STATUS_NEW }, writes: [event] }
    }

    const { primary, rest } = splitPrimary(matches)
    const result = { deletes: ids(rest), duplicates: rest.length }
    const isNewer = feature.version > getVersion(primary)

    if (isLocallyEdited(primary)) {
        return {
            ...result,
            row: {
                ...row,
                orgUnits: [
                    {
                        id: primary.orgUnit,
                        name: getOrgUnitName(primary.orgUnit),
                    },
                ],
                status: isNewer ? OSM_STATUS_CONFLICT : OSM_STATUS_UNCHANGED,
            },
        }
    }
    if (isNewer) {
        const event = toTrackerEvent(
            { ...feature, featureKey: feature.osmId, eventId: primary.event },
            category,
            orgUnit
        )
        return {
            ...result,
            row: { ...row, status: OSM_STATUS_CHANGED },
            writes: [event],
        }
    }
    if (primary.orgUnit !== orgUnit) {
        // Same version: rewritten from what's stored, only the org unit moves
        const event = toTrackerEvent(
            { ...eventToFeature(primary), featureKey: feature.osmId },
            category,
            orgUnit
        )
        return {
            ...result,
            row: { ...row, status: OSM_STATUS_REASSIGNED },
            writes: [event],
        }
    }
    return { ...result, row: { ...row, status: OSM_STATUS_UNCHANGED } }
}

/**
 * A way's pieces against its stored pieces in the area, matched by org unit.
 * Stored pieces keep their UID, pieces in org units the way no longer crosses
 * are deleted.
 */
const compareWay = ({ way, stored, category, getOrgUnitName }) => {
    const flags = [...new Set(way.pieces.flatMap((piece) => piece.flags))]
    const row = getRow(
        way,
        way.pieces.map((piece) => piece.orgUnit),
        flags
    )
    const toPieceEvent = (piece, eventId) =>
        toTrackerEvent(
            {
                ...way,
                ...getGeometryParts(piece.geometry),
                featureKey: way.osmId,
                eventId,
            },
            category,
            piece.orgUnit.id
        )

    if (!stored.length) {
        return {
            row: { ...row, status: OSM_STATUS_NEW },
            writes: way.pieces.map((piece) =>
                toPieceEvent(piece, generateUid())
            ),
        }
    }

    const isNewer = stored.some((event) => way.version > getVersion(event))

    // A local edit flags all pieces, and nothing is written for the way
    if (stored.some(isLocallyEdited)) {
        return {
            row: {
                ...getStoredRow(stored, getOrgUnitName),
                status: isNewer ? OSM_STATUS_CONFLICT : OSM_STATUS_UNCHANGED,
            },
        }
    }

    const storedByOrgUnit = groupBy(stored, (event) => event.orgUnit)
    const primaries = new Map()
    const deletes = []
    let duplicates = 0

    storedByOrgUnit.forEach((events, orgUnitId) => {
        const { primary, rest } = splitPrimary(events)
        primaries.set(orgUnitId, primary)
        deletes.push(...ids(rest))
        duplicates += rest.length
    })

    const writes = way.pieces.flatMap((piece) => {
        const primary = primaries.get(piece.orgUnit.id)
        const event = toPieceEvent(piece, primary?.event ?? generateUid())
        const isSame =
            primary &&
            !(way.version > getVersion(primary)) &&
            getDataValue(primary, DE.lineGeometry) ===
                getDataValue(event, DE.lineGeometry)
        return isSame ? [] : [event]
    })

    const crossed = new Set(way.pieces.map((piece) => piece.orgUnit.id))
    const notCrossed = [...primaries.entries()]
        .filter(([orgUnitId]) => !crossed.has(orgUnitId))
        .map(([, primary]) => primary.event)

    let status = OSM_STATUS_UNCHANGED
    if (writes.length || notCrossed.length) {
        status = isNewer ? OSM_STATUS_CHANGED : OSM_STATUS_REASSIGNED
    }

    return {
        row: { ...row, status },
        writes,
        deletes: [...deletes, ...notCrossed],
        duplicates,
    }
}

/**
 * What an import of an area will do.
 * - points: clipped OSM points with their assigned { orgUnit, flags }
 * - ways: clipped OSM ways with their pieces [{ orgUnit, geometry, flags }]
 * - stored: the program's events in the area's subtree
 * - elsewhere: point events found by OSM id outside the area
 * - isSelected: whether a stored event is in the fetched subcategories. Only
 *   those can be removed: importing primary roads keeps the tracks.
 * Returns preview rows, tracker events to write, events to delete, and the
 * events of features removed from OSM, deleted only if the user agrees.
 */
export const buildImportPlan = ({
    category,
    points = [],
    ways = [],
    stored = [],
    elsewhere = [],
    isSelected = () => true,
    getOrgUnitName = (id) => id,
}) => {
    const storedByOsmId = groupBy(
        stored.filter((event) => getDataValue(event, DE.id)),
        (event) => getDataValue(event, DE.id)
    )
    const elsewhereByOsmId = groupBy(elsewhere, (event) =>
        getDataValue(event, DE.id)
    )

    const results = [
        ...points.map((feature) =>
            comparePoint({
                feature,
                matches: uniqueEvents([
                    ...(storedByOsmId.get(feature.osmId) ?? []),
                    ...(elsewhereByOsmId.get(feature.osmId) ?? []),
                ]),
                category,
                getOrgUnitName,
            })
        ),
        ...ways.map((way) =>
            compareWay({
                way,
                stored: storedByOsmId.get(way.osmId) ?? [],
                category,
                getOrgUnitName,
            })
        ),
    ]

    // Stored features the OSM data no longer has in this area
    const osmIds = new Set([...points, ...ways].map(({ osmId }) => osmId))
    const removedDeletes = []
    storedByOsmId.forEach((events, osmId) => {
        if (osmIds.has(osmId) || !events.some(isSelected)) {
            return
        }
        const isEdited = events.some(isLocallyEdited)
        results.push({
            row: {
                ...getStoredRow(events, getOrgUnitName),
                status: isEdited ? OSM_STATUS_CONFLICT : OSM_STATUS_REMOVED,
            },
        })
        if (!isEdited) {
            removedDeletes.push(...ids(events))
        }
    })

    return {
        rows: results.map(({ row }) => row),
        writes: results.flatMap(({ writes = [] }) => writes),
        deletes: results.flatMap(({ deletes = [] }) => deletes),
        removedDeletes,
        duplicates: results.reduce(
            (sum, { duplicates = 0 }) => sum + duplicates,
            0
        ),
    }
}

/**
 * Saving a reshaped piece of a road. parts: the new shape split per org unit,
 * [{ orgUnitId, geometry }]. The edited piece keeps the parts in its own org
 * unit, parts in an org unit where the road has a piece are merged into it,
 * other parts become new pieces. The edited piece is deleted if no part is
 * left in its org unit. All pieces are flagged, so imports see the edit.
 */
export const getReshapeChanges = ({
    edited,
    siblings,
    parts,
    category,
    username,
}) => {
    const edit = (feature, geometry) =>
        editFeature(feature, { geometry, username })
    const partsByOrgUnit = groupBy(parts, ({ orgUnitId }) => orgUnitId)
    const siblingByOrgUnit = new Map(
        siblings.map((event) => [event.orgUnit, event])
    )

    const writes = [...partsByOrgUnit.entries()].map(
        ([orgUnitId, orgUnitParts]) => {
            const geometries = orgUnitParts.map(({ geometry }) => geometry)
            const sibling = siblingByOrgUnit.get(orgUnitId)
            let feature
            if (orgUnitId === edited.orgUnit) {
                feature = edit(edited, mergeLineGeometries(geometries))
            } else if (sibling) {
                const stored = eventToFeature(sibling)
                feature = edit(
                    stored,
                    mergeLineGeometries([stored.line, ...geometries])
                )
            } else {
                feature = edit(
                    { ...edited, eventId: generateUid() },
                    mergeLineGeometries(geometries)
                )
            }
            return toTrackerEvent(feature, category, orgUnitId)
        }
    )

    const untouched = siblings
        .filter((event) => !partsByOrgUnit.has(event.orgUnit))
        .map((event) =>
            toTrackerEvent(edit(eventToFeature(event)), category, event.orgUnit)
        )

    return {
        writes: [...writes, ...untouched],
        deletes: partsByOrgUnit.has(edited.orgUnit) ? [] : [edited.eventId],
    }
}

// Whether a stored event is in the subcategories. Events from before the
// tag data element are matched by their type.
export const isEventInSubcategories = (event, category, subcategoryIds) => {
    const subcategory = getDataValue(event, DE.subcategory)
    if (subcategory) {
        return subcategoryIds.includes(subcategory)
    }
    const type = getType(event)
    return category.tags.some(
        (tag) => tag.value === type && subcategoryIds.includes(tag.subcategory)
    )
}

// Events read back from DHIS2, as GeoJSON. Roads use the stored line.
export const eventsToFeatureCollection = (
    events,
    getOrgUnitName = (id) => id
) => ({
    type: 'FeatureCollection',
    features: events.map((event) => {
        const line = getDataValue(event, DE.lineGeometry)
        return {
            type: 'Feature',
            id: event.event,
            geometry: line ? JSON.parse(line) : event.geometry,
            properties: {
                id: event.event,
                name: getDataValue(event, DE.name),
                orgUnit: getOrgUnitName(event.orgUnit),
                type: getType(event),
                tag: getDataValue(event, DE.tag),
                osmId: getDataValue(event, DE.id),
                editedBy: getDataValue(event, DE.editedBy),
                length: getDataValue(event, DE.length),
            },
        }
    }),
})
