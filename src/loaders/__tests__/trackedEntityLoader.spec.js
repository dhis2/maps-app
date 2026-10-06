import { loadTrackedEntitiesFromAnalytics } from '../../util/trackedEntity.js'
import trackedEntityLoader, { parseJsonConfig } from '../trackedEntityLoader.js'

jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

jest.mock('../../util/trackedEntity.js', () => ({
    ...jest.requireActual('../../util/trackedEntity.js'),
    loadTrackedEntitiesFromAnalytics: jest.fn(),
}))

const point = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [1, 2] },
    properties: { id: 'te1' },
}

const baseConfig = {
    layer: 'trackedEntity',
    trackedEntityType: { id: 'teTypeId', name: 'Person' },
    rows: [{ dimension: 'ou', items: [{ id: 'ou1' }] }],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
}

const v40 = { major: 2, minor: 40, patch: 12 }
const v41 = { major: 2, minor: 41, patch: 0 }

const createEngine = (trackerResponse) => ({
    query: jest.fn().mockResolvedValue({ trackedEntities: trackerResponse }),
})

describe('trackedEntityLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('loads from analytics on 2.41+', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({
            data: [point],
            isTruncated: false,
        })
        const engine = createEngine()

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(loadTrackedEntitiesFromAnalytics).toHaveBeenCalledTimes(1)
        expect(engine.query).not.toHaveBeenCalled()
        expect(result.data).toEqual([point])
        expect(result.alerts).toEqual([])
        expect(result.isLoaded).toBe(true)
    })

    it('defaults the org unit mode to descendants on 2.41+', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({ data: [point] })

        await trackedEntityLoader({
            config: { ...baseConfig },
            engine: createEngine(),
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(
            loadTrackedEntitiesFromAnalytics.mock.calls[0][0].config
                .organisationUnitSelectionMode
        ).toBe('DESCENDANTS')
    })

    it('loads from the tracker API on 2.40', async () => {
        const engine = createEngine({
            instances: [
                { id: 'te1', geometry: { type: 'Point', coordinates: [1, 2] } },
                { id: 'te2' },
            ],
        })

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            analyticsEngine: {},
            serverVersion: v40,
        })

        expect(loadTrackedEntitiesFromAnalytics).not.toHaveBeenCalled()
        expect(engine.query.mock.calls[0][1].variables).toMatchObject({
            orgUnit: 'ou1',
            ouMode: 'SELECTED',
        })
        expect(result.data).toEqual([point])
    })

    it('loads from the tracker API on 2.41+ when follow-up is requested', async () => {
        const engine = createEngine({ trackedEntities: [] })

        await trackedEntityLoader({
            config: {
                ...baseConfig,
                program: { id: 'programId', name: 'Malaria' },
                followUp: true,
            },
            engine,
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(loadTrackedEntitiesFromAnalytics).not.toHaveBeenCalled()
        expect(engine.query.mock.calls[0][1].variables.followUp).toBe('TRUE')
    })

    it('loads relationships from the tracker API and adds them to the legend', async () => {
        const relationship = {
            relationship: 'rel1',
            relationshipType: 'relType',
            from: { trackedEntity: { trackedEntity: 'te1' } },
            to: { trackedEntity: { trackedEntity: 'te2' } },
        }
        const constraint = {
            relationshipEntity: 'TRACKED_ENTITY_INSTANCE',
            trackedEntityType: { id: 'teTypeId' },
        }
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce({
                    trackedEntities: {
                        trackedEntities: [
                            {
                                id: 'te1',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [1, 2],
                                },
                                relationships: [relationship],
                            },
                            {
                                id: 'te2',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [3, 4],
                                },
                                relationships: [relationship],
                            },
                        ],
                    },
                })
                .mockResolvedValueOnce({
                    relationshipType: {
                        id: 'relType',
                        displayName: 'Contact',
                        fromConstraint: constraint,
                        toConstraint: constraint,
                    },
                })
                .mockResolvedValueOnce({
                    relatedEntityType: {
                        displayName: 'Person',
                        featureType: 'POINT',
                    },
                }),
        }

        const result = await trackedEntityLoader({
            // Saved maps store relationships in the config JSON
            config: {
                ...baseConfig,
                config: JSON.stringify({ relationships: { type: 'relType' } }),
            },
            engine,
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(loadTrackedEntitiesFromAnalytics).not.toHaveBeenCalled()
        expect(result.relationships.map((r) => r.id)).toEqual(['rel1'])
        expect(result.secondaryData.map((f) => f.properties.id)).toEqual([
            'te2',
        ])
        expect(result.legend.items.map((item) => item.name)).toEqual([
            'Person',
            'Contact',
            'Person (related)',
        ])
        expect(result.alerts).toEqual([])
    })

    it('warns when the result is truncated', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({
            data: [point],
            isTruncated: true,
            limit: 50000,
        })

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine: createEngine(),
            analyticsEngine: {},
            serverVersion: v41,
            keyAnalysisDigitGroupSeparator: 'COMMA',
        })

        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'TRACKED_ENTITIES_TRUNCATED',
                severity: 'warning',
                title: 'Showing the first 50,000 tracked entities',
            }),
        ])
    })

    it('warns when the tracker API hits the server limit', async () => {
        const engine = createEngine({
            instances: [
                { id: 'te1', geometry: { type: 'Point', coordinates: [1, 2] } },
                { id: 'te2' },
            ],
        })

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            analyticsEngine: {},
            serverVersion: v40,
            KeyTrackedEntityInstanceMaxLimit: 2,
        })

        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'TRACKED_ENTITIES_TRUNCATED',
                title: 'Showing the first 2 tracked entities',
            }),
        ])
    })

    it('warns when there is no data', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({ data: [] })

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine: createEngine(),
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(result.alerts).toEqual([
            expect.objectContaining({ id: 'NO_DATA', severity: 'warning' }),
        ])
    })

    it('returns an error alert instead of throwing', async () => {
        loadTrackedEntitiesFromAnalytics.mockRejectedValue(new Error('Boom'))

        const result = await trackedEntityLoader({
            config: { ...baseConfig, loadError: 'Previous error' },
            engine: createEngine(),
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'LOAD_FAILED',
                severity: 'error',
                details: {
                    message: 'Boom',
                    request: 'analytics/trackedEntities/query',
                },
            }),
        ])
        expect(result.loadError).toBeUndefined()
        expect(result.data).toEqual([])
        expect(result.isLoaded).toBe(true)
    })

    it('returns an error alert when the tracker API fails', async () => {
        const engine = { query: jest.fn().mockRejectedValue(new Error('Boom')) }

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            analyticsEngine: {},
            serverVersion: v40,
        })

        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'LOAD_FAILED',
                details: {
                    message: 'Boom',
                    request: 'tracker/trackedEntities',
                },
            }),
        ])
        expect(result.isLoaded).toBe(true)
    })
})

describe('trackedEntityLoader errors', () => {
    const fetchError = (details, type = 'unknown') =>
        Object.assign(new Error(details.message ?? 'Server error'), {
            type,
            details,
        })
    const load = (overrides = {}) =>
        trackedEntityLoader({
            config: { ...baseConfig },
            engine: createEngine({ trackedEntities: [] }),
            analyticsEngine: {},
            serverVersion: v41,
            ...overrides,
        })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each(['E7144', 'E7217'])(
        'falls back to the tracker API on analytics error %s',
        async (errorCode) => {
            loadTrackedEntitiesFromAnalytics.mockRejectedValue(
                fetchError({ errorCode })
            )
            const engine = createEngine({
                trackedEntities: [
                    {
                        id: 'te1',
                        geometry: { type: 'Point', coordinates: [1, 2] },
                    },
                ],
            })

            const result = await load({ engine })

            expect(engine.query).toHaveBeenCalledTimes(1)
            expect(result.data).toEqual([point])
            expect(result.alerts).toEqual([])
        }
    )

    it.each([
        [
            'no access',
            fetchError({ httpStatusCode: 403 }, 'access'),
            'NO_ACCESS',
        ],
        [
            'a missing program',
            fetchError({ errorCode: 'E7129' }),
            'PROGRAM_UNAVAILABLE',
        ],
        [
            'a missing tracked entity type',
            fetchError({ errorCode: 'E7125' }),
            'TRACKED_ENTITY_TYPE_UNAVAILABLE',
        ],
        [
            'org units outside the user access',
            fetchError({ errorCode: 'E7120' }),
            'ORG_UNITS_UNAVAILABLE',
        ],
        [
            'invalid org units',
            fetchError({ errorCode: 'E7143' }),
            'ORG_UNITS_UNAVAILABLE',
        ],
        ['any other error', fetchError({ errorCode: 'E7999' }), 'LOAD_FAILED'],
    ])('maps %s to %s', async (_, error, id) => {
        loadTrackedEntitiesFromAnalytics.mockRejectedValue(error)

        const result = await load()

        expect(result.alerts).toEqual([
            expect.objectContaining({ id, severity: 'error' }),
        ])
    })

    it('maps tracker API errors too', async () => {
        const engine = {
            query: jest
                .fn()
                .mockRejectedValue(
                    fetchError({ httpStatusCode: 400, errorCode: 'E1003' })
                ),
        }

        const result = await load({ engine, serverVersion: v40 })

        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'PROGRAM_UNAVAILABLE',
                details: expect.objectContaining({
                    errorCode: 'E1003',
                    request: 'tracker/trackedEntities',
                }),
            }),
        ])
    })

    it('keeps the tracked entities when relationships fail to load', async () => {
        const engine = {
            query: jest
                .fn()
                .mockResolvedValueOnce({
                    trackedEntities: {
                        trackedEntities: [
                            {
                                id: 'te1',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [1, 2],
                                },
                            },
                        ],
                    },
                })
                .mockRejectedValueOnce(fetchError({ httpStatusCode: 404 })),
        }

        const result = await load({
            config: { ...baseConfig, relationshipType: 'relType' },
            engine,
        })

        expect(result.data).toEqual([point])
        expect(result.relationships).toBeUndefined()
        expect(result.alerts).toEqual([
            expect.objectContaining({
                id: 'RELATIONSHIPS_FAILED',
                severity: 'warning',
                details: expect.objectContaining({ httpStatusCode: 404 }),
            }),
        ])
    })

    it('shows an unknown program status as is', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({ data: [point] })

        const result = await load({
            config: {
                ...baseConfig,
                program: { id: 'programId', name: 'Malaria' },
                programStatus: 'UNKNOWN',
            },
        })

        expect(result.legend.explanation).toEqual(['Program status: UNKNOWN'])
    })

    it('finishes loading when the config is broken', async () => {
        const result = await load({
            config: { ...baseConfig, trackedEntityType: undefined },
        })

        expect(result.isLoaded).toBe(true)
        expect(result.alerts).toEqual([
            expect.objectContaining({ id: 'LOAD_FAILED', severity: 'error' }),
        ])
    })
})

describe('parseJsonConfig', () => {
    it('extracts periodType when relationships is null', () => {
        const config = {
            config: JSON.stringify({
                relationships: null,
                periodType: 'program',
            }),
        }
        parseJsonConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })

    it('extracts both periodType and relationship fields when relationships is set', () => {
        const config = {
            config: JSON.stringify({
                relationships: {
                    type: 'rel-type-id',
                    pointColor: '#ff0000',
                    pointRadius: 5,
                    lineColor: '#0000ff',
                    relationshipOutsideProgram: true,
                },
                periodType: 'program',
            }),
        }
        parseJsonConfig(config)
        expect(config.periodType).toBe('program')
        expect(config.relationshipType).toBe('rel-type-id')
        expect(config.relatedPointColor).toBe('#ff0000')
        expect(config.relatedPointRadius).toBe(5)
        expect(config.relationshipLineColor).toBe('#0000ff')
        expect(config.relationshipOutsideProgram).toBe(true)
        expect(config.config).toBeUndefined()
    })

    it('does nothing when config.config is absent', () => {
        const config = { layer: 'trackedEntity' }
        parseJsonConfig(config)
        expect(config).toEqual({ layer: 'trackedEntity' })
    })

    it('does not throw and leaves config intact on malformed JSON', () => {
        const config = { config: 'not-valid-json' }
        expect(() => parseJsonConfig(config)).not.toThrow()
        expect(config.periodType).toBeUndefined()
        expect(config.config).toBeUndefined()
    })
})
