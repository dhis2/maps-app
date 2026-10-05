import { Analytics } from '@dhis2/analytics'
import {
    canLoadTrackedEntitiesFromAnalytics,
    createTrackedEntityFeatures,
    getTrackedEntityDefaultOrgUnitMode,
    loadTrackedEntitiesFromAnalytics,
    loadTrackedEntitiesFromTracker,
} from '../trackedEntity.js'

const v42 = { minor: 42 }
const mockEngine = { query: jest.fn() }
const analyticsEngine = Analytics.getAnalytics(mockEngine)

const baseConfig = {
    trackedEntityType: { id: 'teTypeId' },
    rows: [{ dimension: 'ou', items: [{ id: 'ou1' }, { id: 'ou2' }] }],
}

const headers = [
    { name: 'trackedentity' },
    { name: 'lastupdated' },
    { name: 'geometry' },
    { name: 'longitude' },
    { name: 'latitude' },
]

const response = (rows, pager = { page: 1, isLastPage: true }) => ({
    headers,
    rows,
    metaData: { pager },
})

// Returns the variables the analytics client sends to the data engine
const loadAndGetVariables = async (config) => {
    mockEngine.query.mockResolvedValueOnce({ data: response([]) })
    await loadTrackedEntitiesFromAnalytics({
        config,
        analyticsEngine,
        serverVersion: v42,
    })
    return mockEngine.query.mock.calls[0][1].variables
}

describe('getTrackedEntityAnalyticsRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('requests trackedEntities/query with the type in the path', async () => {
        const variables = await loadAndGetVariables(baseConfig)

        expect(variables.path).toBe('trackedEntities/query')
        expect(variables.trackedEntityType).toBe('teTypeId')
        expect(variables.program).toBeUndefined()
        expect(variables.dimensions).toEqual(['ou:ou1;ou2'])
        // The loader resolves the default org unit mode
        expect(variables.parameters).toEqual({
            geometryOnly: true,
            pageSize: 50000,
        })
    })

    it('passes program and qualified program status as query params', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            program: { id: 'programId' },
            programStatus: 'COMPLETED',
            organisationUnitSelectionMode: 'SELECTED',
        })

        // Not in the path: trackedEntities/query/{program} is invalid
        expect(variables.program).toBeUndefined()
        expect(variables.parameters).toMatchObject({
            program: 'programId',
            programStatus: 'programId.COMPLETED',
            ouMode: 'SELECTED',
        })
    })

    it('ignores program status without a program', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            programStatus: 'COMPLETED',
        })

        expect(variables.parameters.programStatus).toBeUndefined()
    })

    it('filters by last updated date range by default', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            startDate: '2024-01-01T00:00:00.000',
            endDate: '2024-12-31T00:00:00.000',
        })

        expect(variables.parameters.lastUpdated).toBe('2024-01-01_2024-12-31')
        expect(variables.parameters.enrollmentDate).toBeUndefined()
    })

    it('filters by program-qualified enrollment date range', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            program: { id: 'programId' },
            periodType: 'program',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
        })

        expect(variables.parameters.enrollmentDate).toBe(
            'programId.2024-01-01_2024-12-31'
        )
        expect(variables.parameters.lastUpdated).toBeUndefined()
    })

    it('skips period filter when the range is incomplete', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            startDate: '2024-01-01',
        })

        expect(variables.parameters.lastUpdated).toBeUndefined()
        expect(variables.parameters.enrollmentDate).toBeUndefined()
    })
    it('skips the enrollment period without a program', async () => {
        const variables = await loadAndGetVariables({
            ...baseConfig,
            periodType: 'program',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
        })

        expect(variables.parameters.enrollmentDate).toBeUndefined()
        expect(variables.parameters.lastUpdated).toBeUndefined()
    })
})

describe('createTrackedEntityFeatures', () => {
    it('creates point and polygon features from WKT', () => {
        const features = createTrackedEntityFeatures(
            response([
                ['te1', '', 'SRID=4326;POINT(-11.8 8.3)', '-11.8', '8.3'],
                ['te2', '', 'POLYGON((0 0,1 0,1 1,0 0))', '', ''],
            ]),
            v42
        )

        expect(features).toEqual([
            {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [-11.8, 8.3] },
                properties: { id: 'te1' },
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [1, 0],
                            [1, 1],
                            [0, 0],
                        ],
                    ],
                },
                properties: { id: 'te2' },
            },
        ])
    })

    it('skips rows without a valid geometry', () => {
        const features = createTrackedEntityFeatures(
            response([
                ['te1', '', '', '', ''],
                ['te2', '', 'LINESTRING(0 0,1 1)', '', ''],
            ]),
            v42
        )

        expect(features).toEqual([])
    })

    it.each([
        [{ minor: 41 }, 'trackedentityinstanceuid'],
        [{ minor: 42 }, 'trackedentity'],
    ])('on %p reads the id from %p', (serverVersion, idColumn) => {
        const features = createTrackedEntityFeatures(
            {
                headers: [
                    { name: 'trackedentity' },
                    { name: 'trackedentityinstanceuid' },
                    { name: 'geometry' },
                ],
                rows: [
                    idColumn === 'trackedentity'
                        ? ['te1', '', 'POINT(1 2)']
                        : ['', 'te1', 'POINT(1 2)'],
                ],
            },
            serverVersion
        )

        expect(features[0].properties.id).toBe('te1')
    })
})

describe('loadTrackedEntitiesFromAnalytics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each([
        [{ page: 1, isLastPage: true }, false],
        [{ page: 1, isLastPage: false }, true],
    ])('with pager %p returns isTruncated %p', async (pager, expected) => {
        mockEngine.query.mockResolvedValueOnce({
            data: response([['te1', '', 'POINT(1 2)', '1', '2']], pager),
        })

        const { data, isTruncated } = await loadTrackedEntitiesFromAnalytics({
            config: baseConfig,
            analyticsEngine,
            serverVersion: v42,
            pageSize: 1,
        })

        expect(data).toHaveLength(1)
        expect(isTruncated).toBe(expected)
        expect(
            mockEngine.query.mock.calls[0][1].variables.parameters.pageSize
        ).toBe(1)
    })

    it('is not truncated when empty, although isLastPage is false', async () => {
        mockEngine.query.mockResolvedValueOnce({
            data: response([], { page: 1, isLastPage: false }),
        })

        const { data, isTruncated } = await loadTrackedEntitiesFromAnalytics({
            config: baseConfig,
            analyticsEngine,
            serverVersion: v42,
        })

        expect(data).toEqual([])
        expect(isTruncated).toBe(false)
    })
})

describe('getTrackedEntityDefaultOrgUnitMode', () => {
    it('returns SELECTED on 2.40', () => {
        expect(getTrackedEntityDefaultOrgUnitMode({ minor: 40 })).toBe(
            'SELECTED'
        )
    })

    it('returns DESCENDANTS from 2.41', () => {
        expect(getTrackedEntityDefaultOrgUnitMode({ minor: 41 })).toBe(
            'DESCENDANTS'
        )
    })
})

describe('loadTrackedEntitiesFromTracker', () => {
    const polygon = {
        type: 'Polygon',
        coordinates: [
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 0],
            ],
        ],
    }
    const trackedEntities = [
        { id: 'te1', geometry: { type: 'Point', coordinates: [1, 2] } },
        { id: 'te2', geometry: polygon },
        { id: 'te3', geometry: { type: 'LineString', coordinates: [] } },
        { id: 'te4' },
    ]
    const config = {
        ...baseConfig,
        program: { id: 'programId' },
        organisationUnitSelectionMode: 'SELECTED',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
    }

    it('uses the 2.40 tracker API params and response', async () => {
        const engine = {
            query: jest.fn().mockResolvedValue({
                trackedEntities: { instances: trackedEntities },
            }),
        }

        const { data, instances, orgUnits } =
            await loadTrackedEntitiesFromTracker({
                config,
                engine,
                serverVersion: { minor: 40 },
            })

        const [query, { variables }] = engine.query.mock.calls[0]
        expect(query.trackedEntities.params(variables)).toMatchObject({
            orgUnit: 'ou1;ou2',
            ouMode: 'SELECTED',
            program: 'programId',
            updatedAfter: '2024-01-01',
            skipPaging: true,
        })
        expect(orgUnits).toBe('ou1;ou2')
        expect(instances.map((i) => i.id)).toEqual(['te1', 'te2'])
        expect(data.map((f) => f.properties.id)).toEqual(['te1', 'te2'])
    })

    it('uses the 2.41 tracker API params and response', async () => {
        const engine = {
            query: jest.fn().mockResolvedValue({
                trackedEntities: { trackedEntities },
            }),
        }

        const { data, instances, orgUnits } =
            await loadTrackedEntitiesFromTracker({
                config,
                engine,
                serverVersion: { minor: 41 },
            })

        const [query, { variables }] = engine.query.mock.calls[0]
        expect(query.trackedEntities.params(variables)).toMatchObject({
            orgUnits: 'ou1,ou2',
            orgUnitMode: 'SELECTED',
            program: 'programId',
            paging: false,
        })
        expect(orgUnits).toBe('ou1,ou2')
        expect(instances.map((i) => i.id)).toEqual(['te1', 'te2'])
        expect(data.map((f) => f.properties.id)).toEqual(['te1', 'te2'])
    })
})

describe('loadTrackedEntitiesFromTracker filters', () => {
    const load = async (config, serverVersion = { minor: 40 }) => {
        const responseKey =
            serverVersion.minor >= 41 ? 'trackedEntities' : 'instances'
        const engine = {
            query: jest.fn().mockResolvedValue({
                trackedEntities: { [responseKey]: [] },
            }),
        }
        await loadTrackedEntitiesFromTracker({ config, engine, serverVersion })
        return engine.query.mock.calls[0][1].variables
    }

    it('applies the same program-scoped rules as analytics', async () => {
        const params = await load({
            ...baseConfig,
            programStatus: 'COMPLETED',
            followUp: true,
            periodType: 'program',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
        })

        expect(params).toMatchObject({ trackedEntityType: 'teTypeId' })
        expect(params.programStatus).toBeUndefined()
        expect(params.followUp).toBeUndefined()
        expect(params.enrollmentEnrolledAfter).toBeUndefined()
        expect(params.updatedAfter).toBeUndefined()
    })

    it('skips the period when the range is incomplete', async () => {
        const params = await load({ ...baseConfig, startDate: '2024-01-01' })

        expect(params.updatedAfter).toBeUndefined()
        expect(params.updatedBefore).toBeUndefined()
    })

    it.each([{ minor: 40 }, { minor: 41 }])(
        'sends follow-up on %p',
        async (serverVersion) => {
            const config = { ...baseConfig, program: { id: 'programId' } }

            expect(
                (await load({ ...config, followUp: true }, serverVersion))
                    .followUp
            ).toBe('TRUE')
            expect(
                (await load({ ...config, followUp: false }, serverVersion))
                    .followUp
            ).toBeUndefined()
            expect((await load(config, serverVersion)).followUp).toBeUndefined()
        }
    )
})

describe('canLoadTrackedEntitiesFromAnalytics', () => {
    const program = { id: 'programId' }

    it.each([
        { name: 'a plain layer on 2.41+', expected: true },
        { name: 'any layer on 2.40', minor: 40, expected: false },
        {
            name: 'relationships',
            config: { relationshipType: 'relType' },
            expected: false,
        },
        {
            name: 'follow-up',
            config: { program, followUp: true },
            expected: false,
        },
        {
            name: 'unchecked follow-up',
            config: { program, followUp: false },
            expected: true,
        },
        {
            name: 'follow-up without program',
            config: { followUp: true },
            expected: true,
        },
    ])('$name => $expected', ({ config = {}, minor = 43, expected }) => {
        expect(canLoadTrackedEntitiesFromAnalytics(config, { minor })).toBe(
            expected
        )
    })
})
