import { renderHook } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { EVENT_LAYER } from '../../constants/layers.js'
import eventLoader from '../../loaders/eventLoader.js'
import { useLayersLoader } from '../useLayersLoader.js'

let mockCachedData

// useLayersLoader.js pulls in earthEngineLoader.js -> util/earthEngine.js ->
// MapApi.js -> @dhis2/maps-gl, which needs browser APIs jsdom doesn't
// provide. Same workaround as earthEngineLoader.spec.js/trackedEntityLoader.spec.js.
jest.mock('../../components/map/MapApi.js', () => ({
    loadEarthEngineWorker: jest.fn(),
}))

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({}),
    useConfig: () => ({
        baseUrl: 'https://example.org',
        serverVersion: '2.42',
    }),
}))

jest.mock('@dhis2/app-service-alerts', () => ({
    useAlert: () => ({ show: jest.fn() }),
}))

jest.mock('@dhis2/analytics', () => ({
    Analytics: { getAnalytics: jest.fn(() => ({})) },
    useDataOutputPeriodTypes: () => undefined,
}))

jest.mock('../../components/cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => mockCachedData,
}))

// Never resolves - the reload-trigger tests only care about the synchronous
// setLayerLoading dispatch, not the loader's eventual result.
jest.mock('../../loaders/eventLoader.js', () => ({
    __esModule: true,
    default: jest.fn(() => new Promise(() => {})),
}))

const mockStore = configureMockStore()

const renderWithStore = (state) => {
    const store = mockStore(state)
    const wrapper = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    )
    renderHook(() => useLayersLoader(), { wrapper })
    return { store }
}

const baseLayer = {
    id: 'a',
    layer: EVENT_LAYER,
    isLoaded: true,
    isLoading: false,
}

beforeEach(() => {
    eventLoader.mockClear()
    mockCachedData = {
        systemSettings: { keyAnalysisDigitGroupSeparator: 'NONE' },
        currentUser: {
            id: 'user1',
            keyAnalysisDisplayProperty: 'name',
            userOrgUnitIdsByKeyword: {},
        },
        spatialSupport: true,
    }
})

describe('useLayersLoader - data table reload trigger', () => {
    test('does not reload a server-clustered layer when the table opens and forceClientCluster is not set', () => {
        const { store } = renderWithStore({
            map: {
                mapViews: [
                    { ...baseLayer, serverCluster: true, isExtended: false },
                ],
            },
            dataTable: 'a',
        })

        expect(store.getActions()).toEqual([])
    })

    test('reloads a server-clustered layer once forceClientCluster is set', () => {
        const { store } = renderWithStore({
            map: {
                mapViews: [
                    {
                        ...baseLayer,
                        serverCluster: true,
                        isExtended: false,
                        forceClientCluster: true,
                    },
                ],
            },
            dataTable: 'a',
        })

        expect(store.getActions()).toEqual([
            { type: 'LAYER_LOADING_SET', id: 'a' },
        ])
    })

    test('does not reload again once isExtended is true, even with forceClientCluster set (no loop)', () => {
        const { store } = renderWithStore({
            map: {
                mapViews: [
                    {
                        ...baseLayer,
                        serverCluster: false,
                        isExtended: true,
                        forceClientCluster: true,
                    },
                ],
            },
            dataTable: 'a',
        })

        expect(store.getActions()).toEqual([])
    })

    test('still reloads a non-clustered layer needing extended data (existing behavior preserved)', () => {
        const { store } = renderWithStore({
            map: {
                mapViews: [
                    { ...baseLayer, serverCluster: false, isExtended: false },
                ],
            },
            dataTable: 'a',
        })

        expect(store.getActions()).toEqual([
            { type: 'LAYER_LOADING_SET', id: 'a' },
        ])
    })
})

describe('useLayersLoader - spatialSupport plumbing', () => {
    test('passes spatialSupport from useCachedData into the event loader call', () => {
        mockCachedData.spatialSupport = true

        renderWithStore({
            map: {
                mapViews: [{ ...baseLayer, isLoaded: false }],
            },
            dataTable: null,
        })

        expect(eventLoader).toHaveBeenCalledWith(
            expect.objectContaining({ spatialSupport: true })
        )
    })

    test('passes spatialSupport: false through unchanged', () => {
        mockCachedData.spatialSupport = false

        renderWithStore({
            map: {
                mapViews: [{ ...baseLayer, isLoaded: false }],
            },
            dataTable: null,
        })

        expect(eventLoader).toHaveBeenCalledWith(
            expect.objectContaining({ spatialSupport: false })
        )
    })
})
