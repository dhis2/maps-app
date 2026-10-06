import { useDataOutputPeriodTypes } from '@dhis2/analytics'
import { renderHook } from '@testing-library/react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import { useLoadLayer } from '../useLoadLayer.js'

jest.mock('@dhis2/analytics', () => ({
    Analytics: { getAnalytics: jest.fn(() => ({ analytics: true })) },
    useDataOutputPeriodTypes: jest.fn(),
}))
jest.mock('@dhis2/app-runtime', () => ({
    useConfig: () => ({ baseUrl: 'base', serverVersion: { minor: 43 } }),
    useDataEngine: () => ({ engine: true }),
}))
jest.mock('../../components/cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: {
            keyAnalysisDigitGroupSeparator: 'SPACE',
            KeyTrackedEntityMaxLimit: 50000,
        },
        currentUser: {
            keyAnalysisDisplayProperty: 'name',
            id: 'user',
            userOrgUnitIdsByKeyword: {},
        },
    }),
}))
jest.mock('../../loaders/earthEngineLoader.js', () => jest.fn())
jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
    poleOfInaccessibility: jest.fn(),
}))

const config = { id: 'layer1', layer: 'earthEngine', name: 'Heat stress' }

const renderLoadLayer = (periodTypeData) => {
    useDataOutputPeriodTypes.mockReturnValue(periodTypeData)
    return renderHook(() => useLoadLayer()).result.current
}

describe('useLoadLayer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        console.error.mockRestore()
    })

    describe('canLoadLayer', () => {
        it('waits for period types for thematic and event layers only', () => {
            const { canLoadLayer } = renderLoadLayer({
                supportsEnabledPeriodTypes: true,
                enabledPeriodTypesData: null,
            })

            expect(canLoadLayer({ layer: 'thematic' })).toBe(false)
            expect(canLoadLayer({ layer: 'event' })).toBe(false)
            expect(canLoadLayer({ layer: 'earthEngine' })).toBe(true)
        })

        it('loads any layer once period types are there', () => {
            const { canLoadLayer } = renderLoadLayer({
                supportsEnabledPeriodTypes: true,
                enabledPeriodTypesData: { enabledTypes: [] },
            })

            expect(canLoadLayer({ layer: 'thematic' })).toBe(true)
        })
    })

    describe('loadLayer', () => {
        it('calls the loader of the layer type with what it needs', async () => {
            earthEngineLoader.mockResolvedValue({ ...config, isLoaded: true })
            const { loadLayer } = renderLoadLayer()

            const result = await loadLayer(config, { loadExtended: true })

            expect(earthEngineLoader).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: expect.objectContaining(config),
                    engine: { engine: true },
                    analyticsEngine: { analytics: true },
                    baseUrl: 'base',
                    serverVersion: { minor: 43 },
                    keyAnalysisDigitGroupSeparator: 'SPACE',
                    keyAnalysisDisplayProperty: 'name',
                    userId: 'user',
                    KeyTrackedEntityMaxLimit: 50000,
                    loadExtended: true,
                })
            )
            expect(result).toEqual({ ...config, isLoaded: true })
        })

        it('does not pass the previous alerts to the loader', async () => {
            earthEngineLoader.mockImplementation(({ config }) => config)
            const { loadLayer } = renderLoadLayer()

            const result = await loadLayer({
                ...config,
                alerts: [{ id: 'NO_DATA' }],
                loadError: 'Boom',
            })

            expect(result.alerts).toBeUndefined()
            expect(result.loadError).toBeUndefined()
        })

        it('turns a thrown error into a loaded layer with an error alert', async () => {
            const error = new Error('Boom')
            earthEngineLoader.mockRejectedValue(error)
            const { loadLayer } = renderLoadLayer()

            const result = await loadLayer(config)

            expect(result).toMatchObject({
                ...config,
                data: [],
                isLoaded: true,
                isLoading: false,
            })
            expect(result.alerts).toEqual([
                expect.objectContaining({
                    id: 'LOAD_FAILED',
                    severity: 'error',
                    details: { message: 'Boom' },
                }),
            ])
            // Kept for developers, as the alert only has the message
            expect(console.error).toHaveBeenCalledWith(error)
        })

        it('handles an unknown layer type the same way', async () => {
            const { loadLayer } = renderLoadLayer()

            const result = await loadLayer({ id: 'layer2', layer: 'unknown' })

            expect(result).toMatchObject({ name: 'Layer', isLoaded: true })
            expect(result.alerts[0].details.message).toBe(
                'Unknown layer type: unknown'
            )
        })
    })
})
