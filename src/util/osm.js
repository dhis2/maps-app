import { OSM_DATA_ELEMENTS as DE } from '../components/osmImport/osmMetadata.js'
import {
    GEO_TYPE_LINE,
    GEO_TYPE_POINT,
    isPointInsideOrgUnits,
} from './geojson.js'
import { OSM_GEOMETRY_LINE } from './osmCategories.js'
import { generateUid } from './uid.js'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export const OSM_STATUS_NEW = 'new'
export const OSM_STATUS_CHANGED = 'changed'
export const OSM_STATUS_UNCHANGED = 'unchanged'

const round = (n) => Math.round(n * 1e6) / 1e6

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

export const buildOverpassQuery = ({ filters, geometry }, bbox) => {
    const area = `(${bbox.join(',')})`
    const output = geometry === OSM_GEOMETRY_LINE ? 'geom' : 'center'

    return `[out:json][timeout:90];
(
${filters.map((filter) => `  ${filter}${area};`).join('\n')}
);
out meta ${output};`
}

export const fetchOsmElements = async (query) => {
    const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
    })

    if (!response.ok) {
        throw new Error(`Overpass request failed (${response.status})`)
    }

    const { elements } = await response.json()
    return elements
}

const getPoint = ({ type, lon, lat, center }) => {
    if (type === 'node') {
        return [round(lon), round(lat)]
    }
    return center ? [round(center.lon), round(center.lat)] : null
}

// One OSM element to a flat feature. Lines keep all vertices, and their
// point is a vertex in the middle of the line.
export const parseOsmElement = (element, category) => {
    const { type, id, tags = {}, version, timestamp } = element
    const line =
        category.geometry === OSM_GEOMETRY_LINE
            ? element.geometry?.map(({ lon, lat }) => [round(lon), round(lat)])
            : undefined
    const point = line ? line[Math.floor(line.length / 2)] : getPoint(element)
    const typeTag = category.typeTags.find((tag) => tags[tag])

    return {
        osmId: `${type}/${id}`,
        name: tags.name ?? '',
        type: typeTag ? tags[typeTag] : '',
        surface: tags.surface,
        version,
        lastEdited: timestamp,
        point,
        line,
    }
}

export const parseOsmElements = (elements, category, orgUnitGeometry) =>
    elements
        .map((element) => parseOsmElement(element, category))
        .filter(
            ({ point }) =>
                point && isPointInsideOrgUnits(point, [orgUnitGeometry])
        )

const getDataValue = (event, dataElement) =>
    event.dataValues?.find((dv) => dv.dataElement === dataElement)?.value

// Compare features with existing events, matched by OSM id
export const compareWithEvents = (features, events) => {
    const eventsByOsmId = new Map(
        events.map((event) => [getDataValue(event, DE.id), event])
    )

    return features.map((feature) => {
        const event = eventsByOsmId.get(feature.osmId)
        if (!event) {
            return { ...feature, status: OSM_STATUS_NEW }
        }
        const storedVersion = Number(getDataValue(event, DE.version))
        return {
            ...feature,
            eventId: event.event,
            status:
                feature.version > storedVersion
                    ? OSM_STATUS_CHANGED
                    : OSM_STATUS_UNCHANGED,
        }
    })
}

export const toTrackerEvent = (feature, category, orgUnit) => {
    const { program } = category
    const values = {
        [DE.id]: feature.osmId,
        [DE.name]: feature.name,
        [DE.version]: feature.version,
        [DE.lastEdited]: feature.lastEdited,
        [category.typeDataElement]: feature.type,
    }

    if (feature.line) {
        values[DE.roadSurface] = feature.surface
        values[DE.lineGeometry] = JSON.stringify({
            type: GEO_TYPE_LINE,
            coordinates: feature.line,
        })
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

// Events read back from DHIS2, as GeoJSON. Roads use the stored line.
export const eventsToFeatureCollection = (events) => ({
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
                osmId: getDataValue(event, DE.id),
                type:
                    getDataValue(event, DE.facilityType) ??
                    getDataValue(event, DE.roadClass),
            },
        }
    }),
})
