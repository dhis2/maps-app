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

    it('warns when the result is truncated', async () => {
        loadTrackedEntitiesFromAnalytics.mockResolvedValue({
            data: [point],
            isTruncated: true,
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
                warning: true,
                code: 'CUSTOM_ALERT',
                message:
                    'Tracked entity: Displaying first 50,000 tracked entities',
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
            { code: 'WARNING_NO_DATA', message: 'Person' },
        ])
    })

    it('sets a load error instead of throwing', async () => {
        loadTrackedEntitiesFromAnalytics.mockRejectedValue(
            new Error('Please ensure analytics job was run')
        )

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine: createEngine(),
            analyticsEngine: {},
            serverVersion: v41,
        })

        expect(result.loadError).toBe('Please ensure analytics job was run')
        expect(result.alerts).toEqual([
            {
                code: 'ERROR_CRITICAL',
                message: 'Please ensure analytics job was run',
            },
        ])
        expect(result.data).toEqual([])
        expect(result.isLoaded).toBe(true)
    })

    it('sets a load error when the tracker API fails', async () => {
        const engine = { query: jest.fn().mockRejectedValue(new Error('Boom')) }

        const result = await trackedEntityLoader({
            config: { ...baseConfig },
            engine,
            analyticsEngine: {},
            serverVersion: v40,
        })

        expect(result.loadError).toBe('Boom')
        expect(result.isLoaded).toBe(true)
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
