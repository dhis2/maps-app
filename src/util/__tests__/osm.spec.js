import { OSM_DATA_ELEMENTS as DE } from '../../components/osmImport/osmMetadata.js'
import { withBbox } from '../orgUnitAssignment.js'
import {
    buildImportPlan,
    buildOverpassCountQuery,
    buildOverpassQuery,
    clipToAreas,
    createManualFeature,
    editFeature,
    eventToFeature,
    eventsToFeatureCollection,
    getBbox,
    getGeometryParts,
    getOverpassElements,
    getReshapeChanges,
    getSubcategoryCounts,
    isEventInSubcategories,
    OSM_STATUS_CHANGED,
    OSM_STATUS_CONFLICT,
    OSM_STATUS_NEW,
    OSM_STATUS_REASSIGNED,
    OSM_STATUS_REMOVED,
    OSM_STATUS_UNCHANGED,
    parseOsmElements,
    toTrackerEvent,
} from '../osm.js'
import { getOsmCategory } from '../osmCategories.js'

const facilities = getOsmCategory('health_facilities')
const roads = getOsmCategory('roads')

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

const area = { id: 'area', name: 'Area', geometry: square([0, 0], [10, 10]) }
const ou1 = { id: 'ou1', name: 'Chiefdom 1' }
const ou2 = { id: 'ou2', name: 'Chiefdom 2' }
const ou3 = { id: 'ou3', name: 'Chiefdom 3' }

const line = (...coordinates) => ({ type: 'LineString', coordinates })

const getValues = (event) =>
    Object.fromEntries(event.dataValues.map((dv) => [dv.dataElement, dv.value]))

// A stored event as the tracker API returns it
const storedEvent = (feature, category, orgUnit) => ({
    ...toTrackerEvent(feature, category, orgUnit),
    updatedAt: '2025-01-01T00:00:00',
})

const point = (osmId, version) => ({
    osmId,
    name: osmId,
    type: 'clinic',
    version,
    lastEdited: '2024-01-01T00:00:00Z',
    editedBy: 'osm_user',
    point: [1, 1],
    orgUnit: ou1,
    flags: [],
})

const storedPoint = (eventId, osmId, { version, orgUnit = 'ou1', ...extra }) =>
    storedEvent(
        { ...point(osmId, version), eventId, featureKey: osmId, ...extra },
        facilities,
        orgUnit
    )

const way = (osmId, version, pieces) => ({
    osmId,
    name: osmId,
    type: 'primary',
    version,
    lastEdited: '2024-01-01T00:00:00Z',
    editedBy: 'osm_user',
    pieces: pieces.map(([orgUnit, geometry]) => ({
        orgUnit,
        geometry,
        flags: [],
    })),
})

const storedPiece = (
    eventId,
    osmId,
    { version, orgUnit, geometry, ...extra }
) =>
    storedEvent(
        {
            ...way(osmId, version, []),
            ...getGeometryParts(geometry),
            eventId,
            featureKey: osmId,
            ...extra,
        },
        roads,
        orgUnit
    )

const west = line([1, 1], [2, 1])
const east = line([2, 1], [3, 1])
const further = line([3, 1], [4, 1])

describe('osm', () => {
    describe('OSM data', () => {
        it('gets the bbox in Overpass order', () => {
            expect(getBbox(area.geometry)).toEqual([0, 0, 10, 10])
        })

        it('builds an Overpass query for the selected subcategories', () => {
            const query = buildOverpassQuery(
                roads,
                [[1, 2, 3, 4]],
                ['primary', 'secondary']
            )
            expect(query).toContain(
                'way["highway"~"^(primary|primary_link|secondary|secondary_link)$"](1,2,3,4);'
            )
            expect(query).toContain('out meta geom;')
            expect(
                buildOverpassQuery(facilities, [[1, 2, 3, 4]], ['pharmacies'])
            ).toContain('out meta center;')
        })

        it('queries every bbox of several areas in one union', () => {
            const query = buildOverpassQuery(
                roads,
                [
                    [1, 2, 3, 4],
                    [5, 6, 7, 8],
                ],
                ['paths']
            )
            expect(query).toContain(
                'way["highway"~"^(path|footway)$"](1,2,3,4);'
            )
            expect(query).toContain(
                'way["highway"~"^(path|footway)$"](5,6,7,8);'
            )
        })

        it('counts per subcategory', () => {
            const query = buildOverpassCountQuery(
                roads,
                [[1, 2, 3, 4]],
                ['primary', 'paths']
            )
            expect(query.match(/out count;/g)).toHaveLength(2)
            expect(query).toContain(
                '(way["highway"~"^(path|footway)$"](1,2,3,4););out count;'
            )

            const counts = getSubcategoryCounts(
                [
                    { type: 'count', tags: { total: '12' } },
                    { type: 'count', tags: { total: '340' } },
                ],
                ['primary', 'paths']
            )
            expect([...counts]).toEqual([
                ['primary', 12],
                ['paths', 340],
            ])
        })

        it('stops on an Overpass runtime error, as data may be partial', () => {
            const remark =
                'runtime error: Query timed out in "query" at line 3 after 91 seconds.'
            expect(() =>
                getOverpassElements({ elements: [{ id: 1 }], remark })
            ).toThrow('Overpass did not return all data')
            expect(
                getOverpassElements({ elements: [{ id: 1 }], remark: 'ok' })
            ).toEqual([{ id: 1 }])
        })

        it('parses points and clips them to the area', () => {
            const features = parseOsmElements(
                [
                    {
                        type: 'node',
                        id: 1,
                        lon: 5,
                        lat: 5,
                        version: 3,
                        timestamp: '2024-01-01T00:00:00Z',
                        user: 'osm_user',
                        tags: { amenity: 'clinic', name: 'Clinic A' },
                    },
                    {
                        type: 'way',
                        id: 2,
                        center: { lon: 20, lat: 20 },
                        tags: { amenity: 'hospital' },
                    },
                ],
                facilities
            )

            expect(clipToAreas(features, [area])).toEqual([
                {
                    areaId: 'area',
                    osmId: 'node/1',
                    name: 'Clinic A',
                    type: 'clinic',
                    tag: 'amenity=clinic',
                    subcategory: 'clinics',
                    surface: undefined,
                    version: 3,
                    lastEdited: '2024-01-01T00:00:00Z',
                    editedBy: 'osm_user',
                    point: [5, 5],
                },
            ])
        })

        it('gives a line its half-length point and length', () => {
            const [road] = parseOsmElements(
                [
                    {
                        type: 'way',
                        id: 3,
                        version: 1,
                        tags: { highway: 'primary', surface: 'asphalt' },
                        geometry: [
                            { lon: 0, lat: 0 },
                            { lon: 0.2, lat: 0 },
                            { lon: 0.4, lat: 0 },
                            { lon: 2, lat: 0 },
                        ],
                    },
                ],
                roads
            )

            expect(road.point).toEqual([1, 0])
            expect(road.line.type).toBe('LineString')
            expect(road.length).toBeGreaterThan(222000)
            expect(road.type).toBe('primary')
        })

        it('keeps the part of a line inside each area', () => {
            const east = {
                id: 'east',
                geometry: square([10, 0], [20, 10]),
            }
            const [road] = clipToAreas(
                [
                    {
                        osmId: 'way/4',
                        ...getGeometryParts(line([-2, 5], [12, 5])),
                    },
                ],
                [area, east]
            )

            expect(road.clips.map(({ areaId }) => areaId)).toEqual([
                'area',
                'east',
            ])
            const [inArea, inEast] = road.clips.map(({ line }) => line)
            expect(inArea.coordinates[0][0]).toBeCloseTo(0, 6)
            expect(inArea.coordinates.at(-1)[0]).toBeCloseTo(10, 6)
            expect(inEast.coordinates[0][0]).toBeCloseTo(10, 6)
            expect(inEast.coordinates.at(-1)).toEqual([12, 5])
        })

        it('gives a point to the first area containing it', () => {
            const east = { id: 'east', geometry: square([10, 0], [20, 10]) }
            const clipped = clipToAreas(
                [
                    { osmId: 'node/1', point: [15, 5] },
                    { osmId: 'node/2', point: [5, 5] },
                    { osmId: 'node/3', point: [25, 5] },
                ],
                [area, east]
            )
            expect(clipped.map(({ osmId, areaId }) => [osmId, areaId])).toEqual(
                [
                    ['node/1', 'east'],
                    ['node/2', 'area'],
                ]
            )
        })
    })

    describe('import of points', () => {
        const plan = (points, stored, elsewhere) =>
            buildImportPlan({ category: facilities, points, stored, elsewhere })

        it('creates, updates, moves and keeps by version and org unit', () => {
            const { rows, writes } = plan(
                [
                    point('node/1', 1),
                    point('node/2', 3),
                    point('node/3', 2),
                    point('node/4', 2),
                ],
                [
                    storedPoint('ev2', 'node/2', { version: 2 }),
                    storedPoint('ev3', 'node/3', { version: 2 }),
                    storedPoint('ev4', 'node/4', {
                        version: 2,
                        orgUnit: 'area',
                    }),
                ]
            )

            expect(rows.map(({ status }) => status)).toEqual([
                OSM_STATUS_NEW,
                OSM_STATUS_CHANGED,
                OSM_STATUS_UNCHANGED,
                OSM_STATUS_REASSIGNED,
            ])
            expect(
                writes.map(({ event, orgUnit }) => [event, orgUnit])
            ).toEqual([
                [expect.any(String), 'ou1'],
                ['ev2', 'ou1'],
                ['ev4', 'ou1'],
            ])
        })

        it('fixes the UID of new features at preview', () => {
            const { writes } = plan([point('node/1', 1)], [])
            expect(writes[0].event).toMatch(/^[a-zA-Z][a-zA-Z0-9]{10}$/)
            expect(getValues(writes[0])[DE.featureKey]).toBe('node/1')
        })

        it('keeps local edits and reports newer OSM versions as conflicts', () => {
            const edited = { locallyEdited: true }
            const { rows, writes } = plan(
                [point('node/1', 3), point('node/2', 2)],
                [
                    storedPoint('ev1', 'node/1', {
                        version: 2,
                        orgUnit: 'ou2',
                        ...edited,
                    }),
                    storedPoint('ev2', 'node/2', {
                        version: 2,
                        orgUnit: 'ou2',
                        ...edited,
                    }),
                ]
            )

            expect(rows.map(({ status }) => status)).toEqual([
                OSM_STATUS_CONFLICT,
                OSM_STATUS_UNCHANGED,
            ])
            expect(writes).toEqual([])
        })

        it('matches a feature moved to another area by OSM id', () => {
            const { rows, writes } = plan(
                [point('node/1', 2)],
                [],
                [
                    storedPoint('ev1', 'node/1', {
                        version: 2,
                        orgUnit: 'elsewhere',
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_REASSIGNED)
            expect(writes[0].event).toBe('ev1')
        })

        it('only removes features of the fetched subcategories', () => {
            const track = storedPiece('ev1', 'way/1', {
                version: 1,
                orgUnit: 'ou1',
                geometry: west,
                type: 'track',
                tag: 'highway=track',
                subcategory: 'tracks_and_service',
            })
            const legacy = storedPiece('ev2', 'way/2', {
                version: 1,
                orgUnit: 'ou1',
                geometry: east,
                type: 'primary',
            })
            const { removedDeletes } = buildImportPlan({
                category: roads,
                ways: [],
                stored: [track, legacy],
                isSelected: (event) =>
                    isEventInSubcategories(event, roads, ['primary']),
            })
            // The track wasn't fetched, the older event is matched by type
            expect(removedDeletes).toEqual(['ev2'])
        })

        it('removes features no longer in OSM, unless edited or added by hand', () => {
            const handAdded = storedEvent(
                {
                    ...createManualFeature({
                        geometry: { type: 'Point', coordinates: [1, 1] },
                        name: 'Hand',
                    }),
                },
                facilities,
                'ou1'
            )
            const { rows, removedDeletes, deletes } = plan(
                [],
                [
                    storedPoint('ev1', 'node/1', { version: 1 }),
                    storedPoint('ev2', 'node/2', {
                        version: 1,
                        orgUnit: 'ou1',
                        locallyEdited: true,
                    }),
                    handAdded,
                ]
            )

            expect(rows.map(({ osmId, status }) => [osmId, status])).toEqual([
                ['node/1', OSM_STATUS_REMOVED],
                ['node/2', OSM_STATUS_CONFLICT],
            ])
            expect(removedDeletes).toEqual(['ev1'])
            expect(deletes).toEqual([])
        })

        it('keeps one primary of duplicate events and deletes the rest', () => {
            const { writes, deletes, duplicates } = plan(
                [point('node/1', 3)],
                [
                    storedPoint('evB', 'node/1', { version: 2 }),
                    storedPoint('evA', 'node/1', { version: 1 }),
                    storedPoint('evC', 'node/1', {
                        version: 2,
                        orgUnit: 'ou1',
                        locallyEdited: true,
                    }),
                ]
            )

            // The locally edited one is the primary, and wins over OSM
            expect(writes).toEqual([])
            expect(deletes.sort()).toEqual(['evA', 'evB'])
            expect(duplicates).toBe(2)
        })
    })

    describe('import of ways split per org unit', () => {
        const plan = (ways, stored) =>
            buildImportPlan({ category: roads, ways, stored })

        it('creates one piece per org unit for a new way', () => {
            const { rows, writes } = plan(
                [
                    way('way/1', 1, [
                        [ou1, west],
                        [ou2, east],
                    ]),
                ],
                []
            )
            expect(rows[0].status).toBe(OSM_STATUS_NEW)
            expect(rows[0].orgUnits.map(({ id }) => id)).toEqual(['ou1', 'ou2'])
            expect(writes.map(({ orgUnit }) => orgUnit)).toEqual(['ou1', 'ou2'])
            expect(Number(getValues(writes[0])[DE.length])).toBeGreaterThan(
                110000
            )
        })

        it('leaves an unchanged way alone', () => {
            const { rows, writes, deletes } = plan(
                [
                    way('way/1', 1, [
                        [ou1, west],
                        [ou2, east],
                    ]),
                ],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_UNCHANGED)
            expect(writes).toEqual([])
            expect(deletes).toEqual([])
        })

        it('updates pieces in place when the geometry changes', () => {
            const moved = line([1, 1.5], [2, 1])
            const { rows, writes } = plan(
                [
                    way('way/1', 2, [
                        [ou1, moved],
                        [ou2, east],
                    ]),
                ],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_CHANGED)
            expect(writes.map(({ event }) => event)).toEqual(['ev1', 'ev2'])
            expect(JSON.parse(getValues(writes[0])[DE.lineGeometry])).toEqual(
                moved
            )
        })

        it('creates a piece when the way crosses another org unit', () => {
            const { writes } = plan(
                [
                    way('way/1', 2, [
                        [ou1, west],
                        [ou2, east],
                        [ou3, further],
                    ]),
                ],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(
                writes.map(({ event, orgUnit }) => [event, orgUnit])
            ).toEqual([
                ['ev1', 'ou1'],
                ['ev2', 'ou2'],
                [expect.any(String), 'ou3'],
            ])
        })

        it('deletes the piece of an org unit the way no longer crosses', () => {
            const { writes, deletes } = plan(
                [way('way/1', 2, [[ou1, west]])],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(writes.map(({ event }) => event)).toEqual(['ev1'])
            expect(deletes).toEqual(['ev2'])
        })

        it('never touches the pieces stored in other areas', () => {
            // Only the area's own pieces are stored events of this import:
            // the neighbour's piece of way/1 isn't in the list
            const { writes, deletes } = plan(
                [way('way/1', 2, [[ou1, west]])],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                ]
            )
            expect(writes.map(({ event }) => event)).toEqual(['ev1'])
            expect(deletes).toEqual([])
        })

        it('handles a way split in OSM into an old and a new id', () => {
            const { rows, writes, deletes } = plan(
                [
                    way('way/1', 2, [[ou1, west]]),
                    way('way/9', 1, [[ou2, east]]),
                ],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(rows.map(({ status }) => status)).toEqual([
                OSM_STATUS_CHANGED,
                OSM_STATUS_NEW,
            ])
            expect(deletes).toEqual(['ev2'])
            expect(writes.map(({ orgUnit }) => orgUnit)).toEqual(['ou1', 'ou2'])
        })

        it('removes the pieces of a way merged into another one in OSM', () => {
            const merged = line([1, 1], [3, 1])
            const { rows, removedDeletes } = plan(
                [way('way/1', 2, [[ou1, merged]])],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/2', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: east,
                    }),
                ]
            )
            expect(rows.map(({ osmId, status }) => [osmId, status])).toEqual([
                ['way/1', OSM_STATUS_CHANGED],
                ['way/2', OSM_STATUS_REMOVED],
            ])
            expect(removedDeletes).toEqual(['ev2'])
        })

        it('removes all pieces of a way deleted or re-tagged in OSM', () => {
            const { rows, removedDeletes } = plan(
                [],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_REMOVED)
            expect(removedDeletes).toEqual(['ev1', 'ev2'])
        })

        it('reports a conflict when a piece was edited locally', () => {
            const { rows, writes, deletes } = plan(
                [way('way/1', 2, [[ou1, west]])],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'ou1',
                        geometry: west,
                    }),
                    storedPiece('ev2', 'way/1', {
                        version: 1,
                        orgUnit: 'ou2',
                        geometry: east,
                        locallyEdited: true,
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_CONFLICT)
            expect(writes).toEqual([])
            expect(deletes).toEqual([])
        })

        it('re-splits a way stored at a higher level, same version', () => {
            // One event per road at district level, from before the split
            const whole = line([1, 1], [2, 1], [3, 1])
            const { rows, writes, deletes } = plan(
                [
                    way('way/1', 1, [
                        [ou1, west],
                        [ou2, east],
                    ]),
                ],
                [
                    storedPiece('ev1', 'way/1', {
                        version: 1,
                        orgUnit: 'district',
                        geometry: whole,
                    }),
                ]
            )
            expect(rows[0].status).toBe(OSM_STATUS_REASSIGNED)
            expect(writes.map(({ orgUnit }) => orgUnit)).toEqual(['ou1', 'ou2'])
            expect(deletes).toEqual(['ev1'])
        })
    })

    describe('features edited in DHIS2', () => {
        it('maps a manual road to an event without OSM id or version', () => {
            const feature = createManualFeature({
                geometry: line([0, 0], [1, 0], [2, 0]),
                name: 'New road',
                type: 'secondary',
                username: 'admin',
            })
            const event = toTrackerEvent(feature, roads, 'ou1')
            const values = getValues(event)

            expect(event.geometry.coordinates).toEqual([1, 0])
            expect(values[DE.id]).toBeUndefined()
            expect(values[DE.version]).toBeUndefined()
            expect(values[DE.featureKey]).toMatch(/^local\//)
            expect(values[DE.editedBy]).toBe('admin')
        })

        it('keeps OSM id, version and line when editing an imported road', () => {
            const stored = storedPiece('ev3', 'way/3', {
                version: 4,
                orgUnit: 'ou1',
                geometry: west,
            })
            const feature = eventToFeature(stored)
            const edited = toTrackerEvent(
                editFeature(feature, {
                    name: 'Main road (new name)',
                    type: 'trunk',
                    surface: 'gravel',
                    username: 'admin',
                }),
                roads,
                feature.orgUnit
            )
            const values = getValues(edited)

            expect(edited.event).toBe('ev3')
            expect(edited.orgUnit).toBe('ou1')
            expect(values[DE.id]).toBe('way/3')
            expect(values[DE.featureKey]).toBe('way/3')
            expect(values[DE.version]).toBe('4')
            expect(values[DE.name]).toBe('Main road (new name)')
            expect(values[DE.roadClass]).toBe('trunk')
            expect(values[DE.editedBy]).toBe('admin')
            expect(values[DE.locallyEdited]).toBe('true')
            expect(JSON.parse(values[DE.lineGeometry])).toEqual(west)
        })

        it('does not flag manual features as locally edited', () => {
            const feature = editFeature(
                { eventId: 'ev4', name: 'Clinic', point: [1, 1] },
                { name: 'Clinic B', type: 'clinic', username: 'admin' }
            )
            const event = toTrackerEvent(feature, facilities, 'ou1')

            expect(getValues(event)[DE.locallyEdited]).toBeUndefined()
        })

        it('merges a reshaped piece into the pieces of the road', () => {
            const edited = eventToFeature(
                storedPiece('ev1', 'way/1', {
                    version: 1,
                    orgUnit: 'ou1',
                    geometry: west,
                })
            )
            const siblings = [
                storedPiece('ev2', 'way/1', {
                    version: 1,
                    orgUnit: 'ou2',
                    geometry: east,
                }),
                storedPiece('ev3', 'way/1', {
                    version: 1,
                    orgUnit: 'ou3',
                    geometry: further,
                }),
            ]
            // The reshaped piece now crosses into ou2 and a new ou4
            const { writes, deletes } = getReshapeChanges({
                edited,
                siblings,
                parts: [
                    { orgUnitId: 'ou2', geometry: line([1.5, 2], [2, 1]) },
                    { orgUnitId: 'ou4', geometry: line([1, 2], [1.5, 2]) },
                ],
                category: roads,
                username: 'admin',
            })

            const byOrgUnit = Object.fromEntries(
                writes.map((event) => [event.orgUnit, event])
            )
            // Merged into the ou2 piece, which ends where east starts
            expect(byOrgUnit.ou2.event).toBe('ev2')
            expect(
                JSON.parse(getValues(byOrgUnit.ou2)[DE.lineGeometry])
            ).toEqual(line([1.5, 2], [2, 1], [3, 1]))
            // New piece with the road's feature key
            expect(byOrgUnit.ou4.event).not.toBe('ev1')
            expect(getValues(byOrgUnit.ou4)[DE.featureKey]).toBe('way/1')
            // Untouched piece flagged as locally edited
            expect(getValues(byOrgUnit.ou3)[DE.locallyEdited]).toBe('true')
            // Nothing left in ou1
            expect(deletes).toEqual(['ev1'])
        })

        it('reads the line of an event back as GeoJSON, with its org unit', () => {
            const event = storedPiece('ev1', 'way/1', {
                version: 1,
                orgUnit: 'ou1',
                geometry: west,
            })
            const { features } = eventsToFeatureCollection([event], (id) =>
                id === 'ou1' ? 'Chiefdom 1' : id
            )
            expect(features[0].geometry).toEqual(west)
            expect(features[0].properties.name).toBe('way/1')
            expect(features[0].properties.orgUnit).toBe('Chiefdom 1')
        })
    })
})
