import {
    USER_ORG_UNIT,
    USER_ORG_UNIT_CHILDREN,
    USER_ORG_UNIT_GRANDCHILDREN,
} from '@dhis2/analytics'
import { WARNING_OU_BOUNDARIES_FETCH_FAILED } from '../../constants/alerts.js'
import { EVENT_SERVER_CLUSTER_COUNT } from '../../constants/layers.js'
import { getUserOrgUnitIdsByKeyword } from '../../util/orgUnits.js'
import {
    GEOFEATURES_QUERY,
    ORG_UNITS_PATHS_QUERY,
} from '../../util/requests.js'
import eventLoader, {
    excludeEventsOutsideOrgUnits,
    shouldUseServerCluster,
} from '../eventLoader.js'

// [0,0]-[10,10]
const SQUARE_A = [
    [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
    ],
]
// [5,5]-[15,15], overlapping SQUARE_A in [5,5]-[10,10]
const SQUARE_B = [
    [
        [5, 5],
        [15, 5],
        [15, 15],
        [5, 15],
        [5, 5],
    ],
]

const geoFeature = (id, coordinates, { level = 2, name = id } = {}) => ({
    id,
    ty: 2,
    co: JSON.stringify(coordinates),
    le: level,
    na: name,
})

const pointFeature = (ouId, coordinates) => ({
    geometry: { type: 'Point', coordinates },
    properties: { ou: ouId },
})

// orgUnitPathsById is keyed by facility id so the mock can filter results by
// the ids actually requested in each batch, like the real endpoint would.
const makeEngine = ({ geoFeatures = [], orgUnitPathsById = {} }) => ({
    query: jest.fn((query, { variables } = {}) => {
        if (query === GEOFEATURES_QUERY) {
            return Promise.resolve({ geoFeatures })
        }
        if (query === ORG_UNITS_PATHS_QUERY) {
            const requestedIds = variables.ids.split(',')
            return Promise.resolve({
                organisationUnits: {
                    organisationUnits: requestedIds
                        .filter((id) => orgUnitPathsById[id])
                        .map((id) => ({ id, path: orgUnitPathsById[id] })),
                },
            })
        }
        throw new Error('Unexpected query')
    }),
})

const makeConfig = (rows, data) => ({
    rows,
    data,
    legend: {},
})

describe('excludeEventsOutsideOrgUnits', () => {
    test('keeps events inside the boundary and tags them with the org unit name', async () => {
        const engine = makeEngine({
            geoFeatures: [geoFeature('ou1', SQUARE_A, { name: 'District A' })],
        })
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [
                pointFeature('fac1', [5, 5]), // inside
                pointFeature('fac2', [50, 50]), // outside
            ]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data).toHaveLength(1)
        expect(config.data[0].properties.ouBoundary).toBe('District A')
        expect(config.legend.eventsOutsideOrgUnitsCount).toBe(1)
        expect(config.dataWithoutCoords).toEqual([
            pointFeature('fac2', [50, 50]),
        ])
        expect(config.legend.orgUnitsWithoutBoundaryCount).toBeUndefined()
    })

    test('records boundary coverage when some selected org units have no boundary', async () => {
        // Only ou1's boundary is returned; ou2 has none.
        const engine = makeEngine({
            geoFeatures: [geoFeature('ou1', SQUARE_A)],
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [pointFeature('fac1', [5, 5])]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.orgUnitsTotalCount).toBe(2)
    })

    test('counts an org unit with degenerate coordinates as missing a boundary', async () => {
        // ou1's coordinates parse to an empty ring, so toGeoJson drops it —
        // it should still count as missing a boundary, not as having one.
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', [[]]),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [pointFeature('fac1', [7, 7])]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.orgUnitsTotalCount).toBe(2)
    })

    test("prioritizes a facility's own ancestor org unit over other overlapping boundaries", async () => {
        // ou1 is checked first by default (same level, listed first), but
        // fac1's actual ancestor is ou2 — the point sits in the overlap,
        // so only the ancestor-first ordering can make ou2 win.
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
            orgUnitPathsById: { fac1: '/root/ou2/fac1' },
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [pointFeature('fac1', [7, 7])] // inside both squares
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data[0].properties.ouBoundary).toBe('District B')
    })

    test('does nothing when no selected org units have a boundary', async () => {
        const engine = makeEngine({ geoFeatures: [] })
        const originalData = [pointFeature('fac1', [5, 5])]
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            originalData
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data).toBe(originalData)
        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.eventsOutsideOrgUnitsCount).toBeUndefined()
    })

    test('keeps events and sets an alert when the boundary fetch fails', async () => {
        const engine = {
            query: jest.fn((query) => {
                if (query === GEOFEATURES_QUERY) {
                    return Promise.reject(new Error('Network error'))
                }
                throw new Error('Unexpected query')
            }),
        }
        const event = pointFeature('fac1', [5, 5])
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [event]
        )
        const alerts = []

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
            alerts,
        })

        expect(config.data).toEqual([event])
        expect(alerts).toEqual([
            expect.objectContaining({
                code: WARNING_OU_BOUNDARIES_FETCH_FAILED,
            }),
        ])
    })

    test('appends to an existing alerts array instead of overwriting it', async () => {
        const engine = {
            query: jest.fn((query) => {
                if (query === GEOFEATURES_QUERY) {
                    return Promise.reject(new Error('Network error'))
                }
                throw new Error('Unexpected query')
            }),
        }
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [pointFeature('fac1', [5, 5])]
        )
        const preExistingAlert = { code: 'SOME_OTHER_ALERT' }
        const alerts = [preExistingAlert]

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
            alerts,
        })

        expect(alerts).toEqual([
            preExistingAlert,
            expect.objectContaining({
                code: WARNING_OU_BOUNDARIES_FETCH_FAILED,
            }),
        ])
        expect(config.alerts).toBeUndefined()
    })

    test('merges org unit path results across batches of more than 100 facilities', async () => {
        // 101 unique facilities forces a second batch (OU_DETAILS_BATCH_SIZE
        // is 100). All events sit in the overlap, so only a correctly
        // resolved ancestor can make a facility's event tag District B.
        const orgUnitPathsById = {}
        const data = []
        for (let i = 0; i < 100; i++) {
            const facId = `fac${i}`
            orgUnitPathsById[facId] = `/root/ou1/${facId}`
            data.push(pointFeature(facId, [7, 7]))
        }
        orgUnitPathsById.fac100 = '/root/ou2/fac100'
        data.push(pointFeature('fac100', [7, 7]))

        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
            orgUnitPathsById,
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            data
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        const pathQueryCalls = engine.query.mock.calls.filter(
            ([query]) => query === ORG_UNITS_PATHS_QUERY
        )
        expect(pathQueryCalls).toHaveLength(2)

        const fac100Event = config.data.find(
            (f) => f.properties.ou === 'fac100'
        )
        expect(fac100Event.properties.ouBoundary).toBe('District B')
    })

    test('passes through non-Point event geometries without classification', async () => {
        const engine = makeEngine({
            geoFeatures: [geoFeature('ou1', SQUARE_A)],
        })
        const polygonEvent = {
            geometry: { type: 'Polygon', coordinates: SQUARE_A },
            properties: { ou: 'fac1' },
        }
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [polygonEvent]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data).toEqual([polygonEvent])
        expect(config.legend.eventsOutsideOrgUnitsCount).toBe(0)
    })

    test('excludes non-Point event org units from the facility path fetch', async () => {
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
            orgUnitPathsById: { fac1: '/root/ou1/fac1' },
        })
        const polygonEvent = {
            geometry: { type: 'Polygon', coordinates: SQUARE_A },
            properties: { ou: 'facPolygonOnly' },
        }
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [pointFeature('fac1', [5, 5]), polygonEvent]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        const pathsCall = engine.query.mock.calls.find(
            ([query]) => query === ORG_UNITS_PATHS_QUERY
        )
        const requestedIds = pathsCall[1].variables.ids.split(',')
        expect(requestedIds).toContain('fac1')
        expect(requestedIds).not.toContain('facPolygonOnly')
    })

    test('falls back to default geometry order when a facility has no resolvable ancestor', async () => {
        // polygonOrgUnitIds.size > 1 triggers path fetching, but this
        // facility's path doesn't lead to any selected org unit.
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
            orgUnitPathsById: { fac1: '/root/other-branch/fac1' },
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [pointFeature('fac1', [7, 7])] // inside the overlap
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        // No ancestor resolved -> default order wins (ou1 listed first)
        expect(config.data[0].properties.ouBoundary).toBe('District A')
    })

    test('prefers the most specific org unit when a facility has no resolvable ancestor', async () => {
        // A region and one of its own districts are both selected; the
        // facility's path doesn't lead to either, so the fallback search
        // must break the tie by level rather than by selection order.
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('region1', SQUARE_B, {
                    level: 2,
                    name: 'Region 1',
                }),
                geoFeature('district1', SQUARE_A, {
                    level: 3,
                    name: 'District 1',
                }),
            ],
            orgUnitPathsById: { fac1: '/root/other-branch/fac1' },
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'region1', name: 'Region 1' },
                        { id: 'district1', name: 'District 1' },
                    ],
                },
            ],
            [pointFeature('fac1', [7, 7])] // inside the overlap
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data[0].properties.ouBoundary).toBe('District 1')
    })

    test('appends outside events to a pre-existing dataWithoutCoords array', async () => {
        const engine = makeEngine({
            geoFeatures: [geoFeature('ou1', SQUARE_A)],
        })
        const existingWithoutCoords = [{ id: 'already-excluded' }]
        const outsideEvent = pointFeature('fac1', [50, 50])
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [outsideEvent]
        )
        config.countFeaturesWithoutCoordinates = true

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: existingWithoutCoords,
        })

        expect(config.dataWithoutCoords).toEqual([
            { id: 'already-excluded' },
            outsideEvent,
        ])
    })

    test("falls back to the 'Organisation unit' property for facility id when 'ou' is absent", async () => {
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
            orgUnitPathsById: { fac1: '/root/ou2/fac1' },
        })
        const feature = {
            geometry: { type: 'Point', coordinates: [7, 7] },
            properties: { 'Organisation unit': 'fac1' },
        }
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [feature]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data[0].properties.ouBoundary).toBe('District B')
    })

    test('classifies points against MultiPolygon org unit boundaries', async () => {
        const multiPolygon = [SQUARE_A]
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', multiPolygon, { name: 'District A' }),
            ],
        })
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [pointFeature('fac1', [5, 5])]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.data[0].properties.ouBoundary).toBe('District A')
    })

    test('skips the org unit path query when no facility ids need resolving', async () => {
        // Multiple polygon OUs would normally trigger ancestor path
        // resolution, but this event has no ou/Organisation unit property.
        const engine = makeEngine({
            geoFeatures: [
                geoFeature('ou1', SQUARE_A, { name: 'District A' }),
                geoFeature('ou2', SQUARE_B, { name: 'District B' }),
            ],
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: 'ou1', name: 'District A' },
                        { id: 'ou2', name: 'District B' },
                    ],
                },
            ],
            [
                {
                    geometry: { type: 'Point', coordinates: [7, 7] },
                    properties: {},
                },
            ]
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        const pathQueryCalls = engine.query.mock.calls.filter(
            ([query]) => query === ORG_UNITS_PATHS_QUERY
        )
        expect(pathQueryCalls).toHaveLength(0)
        expect(config.data[0].properties.ouBoundary).toBe('District A')
    })

    test('always includes outside events in dataWithoutCoords, but only includes no-coordinate events when countFeaturesWithoutCoordinates is enabled', async () => {
        const engine = makeEngine({
            geoFeatures: [geoFeature('ou1', SQUARE_A, { name: 'District A' })],
        })
        const noCoordEvent = { id: 'no-coords' }
        const outsideEvent = pointFeature('fac1', [50, 50])
        const config = makeConfig(
            [{ dimension: 'ou', items: [{ id: 'ou1', name: 'District A' }] }],
            [outsideEvent]
        )
        // countFeaturesWithoutCoordinates intentionally left unset

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [noCoordEvent],
        })

        expect(config.dataWithoutCoords).toEqual([outsideEvent])
    })

    test('resolves USER_ORGUNIT_CHILDREN to the current user org unit’s children for boundary coverage', async () => {
        const userOrgUnitIdsByKeyword = getUserOrgUnitIdsByKeyword([
            { id: 'userOu1', children: [{ id: 'child1' }, { id: 'child2' }] },
        ])
        const engine = makeEngine({
            // Only child1 has a boundary; child2 does not.
            geoFeatures: [geoFeature('child1', SQUARE_A, { name: 'Child 1' })],
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        {
                            id: USER_ORG_UNIT_CHILDREN,
                            name: 'User sub-units',
                        },
                    ],
                },
            ],
            []
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
            userOrgUnitIdsByKeyword,
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.orgUnitsTotalCount).toBe(2)
    })

    test('resolves USER_ORGUNIT_GRANDCHILDREN to the current user org unit’s grandchildren for boundary coverage', async () => {
        const userOrgUnitIdsByKeyword = getUserOrgUnitIdsByKeyword([
            {
                id: 'userOu1',
                children: [
                    {
                        id: 'child1',
                        children: [{ id: 'grand1' }, { id: 'grand2' }],
                    },
                ],
            },
        ])
        const engine = makeEngine({
            geoFeatures: [geoFeature('grand1', SQUARE_A, { name: 'Grand 1' })],
        })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        {
                            id: USER_ORG_UNIT_GRANDCHILDREN,
                            name: 'User sub-x2-units',
                        },
                    ],
                },
            ],
            []
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
            userOrgUnitIdsByKeyword,
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.orgUnitsTotalCount).toBe(2)
    })

    test('does not double-count when a USER_ORGUNIT selection overlaps a literal org unit selection', async () => {
        const userOrgUnitIdsByKeyword = getUserOrgUnitIdsByKeyword([
            { id: 'ou1' },
        ])
        const engine = makeEngine({ geoFeatures: [] }) // ou1 has no boundary
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: USER_ORG_UNIT, name: 'User organisation unit' },
                        { id: 'ou1', name: 'District A' },
                    ],
                },
            ],
            []
        )

        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
            userOrgUnitIdsByKeyword,
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBe(1)
        expect(config.legend.orgUnitsTotalCount).toBe(1)
    })

    test('treats a keyword selection as contributing nothing when userOrgUnitIdsByKeyword is not provided', async () => {
        const engine = makeEngine({ geoFeatures: [] })
        const config = makeConfig(
            [
                {
                    dimension: 'ou',
                    items: [
                        { id: USER_ORG_UNIT, name: 'User organisation unit' },
                    ],
                },
            ],
            []
        )

        // Doesn't throw despite the keyword being unresolvable without
        // userOrgUnitIdsByKeyword, and contributes nothing to the count.
        await excludeEventsOutsideOrgUnits({
            config,
            engine,
            dataWithoutCoords: [],
        })

        expect(config.legend.orgUnitsWithoutBoundaryCount).toBeUndefined()
    })
})

describe('shouldUseServerCluster', () => {
    const overThreshold = EVENT_SERVER_CLUSTER_COUNT + 1

    test('returns true when over threshold and the backend supports spatial clustering', () => {
        expect(
            shouldUseServerCluster({
                count: overThreshold,
                countFeaturesWithoutCoordinates: false,
                countEventsOutsideOrgUnits: false,
                spatialSupport: true,
            })
        ).toBe(true)
    })

    test('returns false when over threshold but the backend has no spatial support', () => {
        expect(
            shouldUseServerCluster({
                count: overThreshold,
                countFeaturesWithoutCoordinates: false,
                countEventsOutsideOrgUnits: false,
                spatialSupport: false,
            })
        ).toBe(false)
    })

    test('returns false when over threshold but spatialSupport is undefined (fails closed)', () => {
        expect(
            shouldUseServerCluster({
                count: overThreshold,
                countFeaturesWithoutCoordinates: false,
                countEventsOutsideOrgUnits: false,
                spatialSupport: undefined,
            })
        ).toBe(false)
    })

    test('returns false when under threshold, regardless of spatialSupport', () => {
        expect(
            shouldUseServerCluster({
                count: EVENT_SERVER_CLUSTER_COUNT,
                countFeaturesWithoutCoordinates: false,
                countEventsOutsideOrgUnits: false,
                spatialSupport: true,
            })
        ).toBe(false)
    })

    test('returns false when countFeaturesWithoutCoordinates is set, regardless of spatialSupport', () => {
        expect(
            shouldUseServerCluster({
                count: overThreshold,
                countFeaturesWithoutCoordinates: true,
                countEventsOutsideOrgUnits: false,
                spatialSupport: true,
            })
        ).toBe(false)
    })

    test('returns false when countEventsOutsideOrgUnits is set, regardless of spatialSupport', () => {
        expect(
            shouldUseServerCluster({
                count: overThreshold,
                countFeaturesWithoutCoordinates: false,
                countEventsOutsideOrgUnits: true,
                spatialSupport: true,
            })
        ).toBe(false)
    })
})

// A minimal chainable stand-in for the real analytics request builder
class FakeAnalyticsRequest {
    withProgram() {
        return this
    }
    withStage() {
        return this
    }
    withCoordinatesOnly() {
        return this
    }
    withStartDate() {
        return this
    }
    withEndDate() {
        return this
    }
    addPeriodFilter() {
        return this
    }
    withRelativePeriodDate() {
        return this
    }
    addOrgUnitDimension() {
        return this
    }
    addDimension() {
        return this
    }
    withCoordinateField() {
        return this
    }
    withEventStatus() {
        return this
    }
    withPageSize() {
        return this
    }
}

describe('eventLoader - isExtended vs serverCluster', () => {
    const overThreshold = EVENT_SERVER_CLUSTER_COUNT + 1

    const baseConfig = () => ({
        program: { id: 'prog1' },
        programStage: { id: 'stage1', name: 'Stage 1' },
        columns: [],
        filters: [],
        rows: [],
        eventClustering: true,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
    })

    const makeArgs = (config) => ({
        config,
        engine: {
            query: jest.fn().mockResolvedValue({
                programStage: { programStageDataElements: [] },
            }),
        },
        keyAnalysisDisplayProperty: 'name',
        keyAnalysisDigitGroupSeparator: 'NONE',
        analyticsEngine: {
            request: FakeAnalyticsRequest,
            events: {
                getCount: jest
                    .fn()
                    .mockResolvedValue({ count: overThreshold, extent: null }),
                getQuery: jest.fn().mockResolvedValue({
                    headers: [],
                    metaData: { items: {}, pager: { total: 0 } },
                    rows: [],
                }),
            },
        },
        periodTypeData: undefined,
        loadExtended: true,
        spatialSupport: true,
    })

    test('does not claim the table has extended data when the layer ends up server-clustered', async () => {
        const result = await eventLoader(makeArgs(baseConfig()))

        expect(result.serverCluster).toBe(true)
        expect(result.isExtended).toBe(false)
        expect(result.data).toBeUndefined()
        // Server clustering isn't capped - the legend shows the true total.
        expect(result.legend.items[0].count).toBe(overThreshold)
    })

    test('forceClientCluster loads the extended dataset instead of staying server-clustered', async () => {
        const result = await eventLoader(
            makeArgs({ ...baseConfig(), forceClientCluster: true })
        )

        expect(result.serverCluster).toBe(false)
        expect(result.isExtended).toBe(true)
        expect(result.data).toEqual([])
        // Once rendering client-side, the legend must reflect what was
        // actually loaded (capped), not the raw analytics total.
        expect(result.legend.items[0].count).toBe(0)
    })
})
