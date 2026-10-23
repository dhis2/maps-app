import { OSM_DATA_ELEMENTS as DE } from '../../components/osmImport/osmMetadata.js'
import {
    buildOverpassQuery,
    compareWithEvents,
    eventsToFeatureCollection,
    getBbox,
    OSM_STATUS_CHANGED,
    OSM_STATUS_NEW,
    OSM_STATUS_UNCHANGED,
    parseOsmElements,
    toTrackerEvent,
} from '../osm.js'
import { getOsmCategories } from '../osmCategories.js'

const [facilities, roads] = getOsmCategories()

const orgUnitGeometry = {
    type: 'Polygon',
    coordinates: [
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
        ],
    ],
}

describe('osm', () => {
    it('gets the bbox in Overpass order', () => {
        expect(getBbox(orgUnitGeometry)).toEqual([0, 0, 10, 10])
    })

    it('builds an Overpass query', () => {
        const query = buildOverpassQuery(roads, [1, 2, 3, 4])
        expect(query).toContain(
            'way["highway"~"^(motorway|trunk|primary|secondary)$"](1,2,3,4);'
        )
        expect(query).toContain('out meta geom;')
        expect(buildOverpassQuery(facilities, [1, 2, 3, 4])).toContain(
            'out meta center;'
        )
    })

    it('parses points and drops features outside the org unit', () => {
        const features = parseOsmElements(
            [
                {
                    type: 'node',
                    id: 1,
                    lon: 5,
                    lat: 5,
                    version: 3,
                    timestamp: '2024-01-01T00:00:00Z',
                    tags: { amenity: 'clinic', name: 'Clinic A' },
                },
                {
                    type: 'way',
                    id: 2,
                    center: { lon: 20, lat: 20 },
                    tags: { amenity: 'hospital' },
                },
            ],
            facilities,
            orgUnitGeometry
        )

        expect(features).toEqual([
            {
                osmId: 'node/1',
                name: 'Clinic A',
                type: 'clinic',
                surface: undefined,
                version: 3,
                lastEdited: '2024-01-01T00:00:00Z',
                point: [5, 5],
                line: undefined,
            },
        ])
    })

    it('uses the middle vertex of a line as its point', () => {
        const [road] = parseOsmElements(
            [
                {
                    type: 'way',
                    id: 3,
                    version: 1,
                    tags: { highway: 'primary', surface: 'asphalt' },
                    geometry: [
                        { lon: 1, lat: 1 },
                        { lon: 2, lat: 2 },
                        { lon: 3, lat: 3 },
                    ],
                },
            ],
            roads,
            orgUnitGeometry
        )

        expect(road.point).toEqual([2, 2])
        expect(road.line).toHaveLength(3)
        expect(road.type).toBe('primary')
    })

    it('compares features with events by OSM id and version', () => {
        const event = (id, osmId, version) => ({
            event: id,
            dataValues: [
                { dataElement: DE.id, value: osmId },
                { dataElement: DE.version, value: String(version) },
            ],
        })
        const result = compareWithEvents(
            [
                { osmId: 'node/1', version: 2 },
                { osmId: 'node/2', version: 5 },
                { osmId: 'node/3', version: 1 },
            ],
            [event('ev1', 'node/1', 2), event('ev2', 'node/2', 4)]
        )

        expect(result.map(({ status }) => status)).toEqual([
            OSM_STATUS_UNCHANGED,
            OSM_STATUS_CHANGED,
            OSM_STATUS_NEW,
        ])
        expect(result[1].eventId).toBe('ev2')
    })

    it('maps a road to an event and back to a line feature', () => {
        const feature = {
            osmId: 'way/3',
            eventId: 'ev3',
            name: 'Main road',
            type: 'primary',
            surface: 'asphalt',
            version: 1,
            lastEdited: '2024-01-01T00:00:00Z',
            point: [2, 2],
            line: [
                [1, 1],
                [2, 2],
                [3, 3],
            ],
        }
        const event = toTrackerEvent(feature, roads, 'ou1')

        expect(event).toMatchObject({
            event: 'ev3',
            program: roads.program.id,
            programStage: roads.program.programStage,
            orgUnit: 'ou1',
            geometry: { type: 'Point', coordinates: [2, 2] },
        })
        expect(event.dataValues).toContainEqual({
            dataElement: DE.roadSurface,
            value: 'asphalt',
        })

        const { features } = eventsToFeatureCollection([event])
        expect(features[0].geometry).toEqual({
            type: 'LineString',
            coordinates: feature.line,
        })
        expect(features[0].properties.name).toBe('Main road')
    })
})
