import { useDataOutputPeriodTypes } from '@dhis2/analytics'
import { renderHook } from '@testing-library/react'
import { loadLayer } from '../../loaders/loadLayer.js'
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
jest.mock('../../loaders/loadLayer.js', () => ({ loadLayer: jest.fn() }))

const pendingPeriodTypes = {
    supportsEnabledPeriodTypes: true,
    enabledPeriodTypesData: null,
}

describe('useLoadLayer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('waits for period types for thematic and event layers only', () => {
        useDataOutputPeriodTypes.mockReturnValue(pendingPeriodTypes)
        const { result } = renderHook(() => useLoadLayer())

        expect(result.current.canLoadLayer({ layer: 'thematic' })).toBe(false)
        expect(result.current.canLoadLayer({ layer: 'event' })).toBe(false)
        expect(result.current.canLoadLayer({ layer: 'earthEngine' })).toBe(true)
    })

    it('loads any layer once period types are there', () => {
        useDataOutputPeriodTypes.mockReturnValue({
            supportsEnabledPeriodTypes: true,
            enabledPeriodTypesData: { enabledTypes: [] },
        })
        const { result } = renderHook(() => useLoadLayer())

        expect(result.current.canLoadLayer({ layer: 'thematic' })).toBe(true)
    })

    it('passes the loader context', () => {
        useDataOutputPeriodTypes.mockReturnValue(undefined)
        const { result } = renderHook(() => useLoadLayer())
        const config = { id: 'layer1', layer: 'trackedEntity' }

        result.current.loadLayer(config, { loadExtended: true })

        expect(loadLayer).toHaveBeenCalledWith(
            config,
            expect.objectContaining({
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
    })
})
