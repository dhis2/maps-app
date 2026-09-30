import { useDataOutputPeriodTypes } from '@dhis2/analytics'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import earthEngineLoader from '../../../loaders/earthEngineLoader.js'
import thematicLoader from '../../../loaders/thematicLoader.js'
import LayerLoader from '../LayerLoader.jsx'

jest.mock('@dhis2/analytics', () => ({
    Analytics: { getAnalytics: jest.fn(() => ({})) },
    useDataOutputPeriodTypes: jest.fn(),
}))
jest.mock('@dhis2/app-runtime', () => ({
    useConfig: () => ({ baseUrl: '', serverVersion: { minor: 43 } }),
    useDataEngine: () => ({}),
}))
jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'SPACE' },
        currentUser: {
            keyAnalysisDisplayProperty: 'name',
            id: 'user',
            userOrgUnitIdsByKeyword: {},
        },
    }),
}))
jest.mock('../../../loaders/earthEngineLoader.js', () => jest.fn())
jest.mock('../../../loaders/thematicLoader.js', () => jest.fn())

const pendingPeriodTypes = {
    supportsEnabledPeriodTypes: true,
    enabledPeriodTypesData: null,
}
const loadedPeriodTypes = {
    supportsEnabledPeriodTypes: true,
    enabledPeriodTypesData: { enabledTypes: [] },
}

describe('LayerLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        earthEngineLoader.mockResolvedValue({ id: 'ee', isLoaded: true })
        thematicLoader.mockResolvedValue({ id: 'th', isLoaded: true })
    })

    test('loads an earth engine layer once when period types resolve later', async () => {
        const config = { id: 'ee', layer: 'earthEngine' }
        const onLoad = jest.fn()

        useDataOutputPeriodTypes.mockReturnValue(pendingPeriodTypes)
        const { rerender } = render(
            <LayerLoader config={config} onLoad={onLoad} />
        )

        useDataOutputPeriodTypes.mockReturnValue(loadedPeriodTypes)
        rerender(<LayerLoader config={config} onLoad={onLoad} />)

        await waitFor(() => expect(onLoad).toHaveBeenCalled())
        expect(earthEngineLoader).toHaveBeenCalledTimes(1)
        expect(onLoad).toHaveBeenCalledTimes(1)
    })

    test('waits for period types before loading a thematic layer', async () => {
        const config = { id: 'th', layer: 'thematic' }
        const onLoad = jest.fn()

        useDataOutputPeriodTypes.mockReturnValue(pendingPeriodTypes)
        const { rerender } = render(
            <LayerLoader config={config} onLoad={onLoad} />
        )
        expect(thematicLoader).not.toHaveBeenCalled()

        useDataOutputPeriodTypes.mockReturnValue(loadedPeriodTypes)
        rerender(<LayerLoader config={config} onLoad={onLoad} />)

        await waitFor(() => expect(onLoad).toHaveBeenCalled())
        expect(thematicLoader).toHaveBeenCalledTimes(1)
    })

    test('reloads when a new config is passed', async () => {
        const onLoad = jest.fn()
        useDataOutputPeriodTypes.mockReturnValue(loadedPeriodTypes)

        const { rerender } = render(
            <LayerLoader
                config={{ id: 'ee', layer: 'earthEngine' }}
                onLoad={onLoad}
            />
        )
        rerender(
            <LayerLoader
                config={{ id: 'ee', layer: 'earthEngine' }}
                onLoad={onLoad}
            />
        )

        await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(2))
        expect(earthEngineLoader).toHaveBeenCalledTimes(2)
    })
})
