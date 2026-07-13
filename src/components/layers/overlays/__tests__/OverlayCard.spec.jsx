import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import OverlayCard from '../OverlayCard.jsx'

const mockShow = jest.fn()

// DataDownloadDialog transitively imports maplibre-gl (via the map API), which
// is not loadable in jsdom and is irrelevant to this test.
jest.mock('../../download/DataDownloadDialog.jsx', () => () => null)

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useConfig: () => ({ baseUrl: 'http://localhost' }),
}))

jest.mock('@dhis2/app-service-datastore', () => ({
    ...jest.requireActual('@dhis2/app-service-datastore'),
    useSetting: () => [undefined, { set: jest.fn() }],
}))

jest.mock('@dhis2/app-service-alerts', () => ({
    ...jest.requireActual('@dhis2/app-service-alerts'),
    useAlert: () => ({ show: mockShow }),
}))

jest.mock('../../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: jest.fn(() => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'NONE' },
    })),
}))

// jsdom has no ResizeObserver; Legend.jsx uses one to measure overflow, which
// is irrelevant to the legend-click wiring under test here.
global.ResizeObserver = class {
    observe() {}
    disconnect() {}
}

const mockStore = configureMockStore()

describe('OverlayCard', () => {
    const renderCard = (name) =>
        render(
            <Provider store={mockStore({ dataTable: null, aggregations: {} })}>
                <OverlayCard
                    layer={{
                        id: 'layer1',
                        name,
                        layer: 'thematic',
                        isLoaded: true,
                        isExpanded: true,
                        isVisible: true,
                        opacity: 1,
                    }}
                />
            </Provider>
        )

    // Regression test for DHIS2-19998: special characters in the layer name
    // must not be HTML-escaped in the "deleted" alert (default i18next
    // interpolation escapes "<" to "&lt;").
    test('shows the raw layer name with special characters in the removal alert', async () => {
        renderCard('Children < 5y & "others"')

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))
        fireEvent.click(await screen.findByText('Remove layer'))

        expect(mockShow).toHaveBeenCalledWith({
            msg: 'Children < 5y & "others" deleted.',
        })
    })
})

describe('OverlayCard legend-driven filter', () => {
    const layer = {
        id: 'layer1',
        name: 'Test layer',
        layer: 'thematic',
        isLoaded: true,
        isExpanded: true,
        isVisible: true,
        opacity: 1,
        dataFilters: {},
        legend: {
            items: [
                { name: 'High', color: '#ff0000' },
                { name: 'Low', color: '#00ff00' },
            ],
        },
    }

    const renderCard = (store) =>
        render(
            <Provider store={store}>
                <OverlayCard layer={layer} />
            </Provider>
        )

    test('opens the table and sets the legend filter on click when the table is closed', () => {
        const store = mockStore({ dataTable: null, aggregations: {} })
        renderCard(store)

        fireEvent.click(screen.getByText('High'))

        const actions = store.getActions()
        expect(actions).toContainEqual({
            type: 'DATA_FILTER_SET',
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['High'],
        })
        expect(actions).toContainEqual({
            type: 'DATA_TABLE_TOGGLE',
            id: 'layer1',
        })
    })

    test('adds to the filter without re-toggling the table when it is already open for this layer', () => {
        const store = mockStore({ dataTable: 'layer1', aggregations: {} })
        renderCard(store)

        fireEvent.click(screen.getByText('Low'))

        const actions = store.getActions()
        expect(actions).toContainEqual({
            type: 'DATA_FILTER_SET',
            layerId: 'layer1',
            fieldId: 'legend',
            filter: ['Low'],
        })
        expect(actions).not.toContainEqual(
            expect.objectContaining({ type: 'DATA_TABLE_TOGGLE' })
        )
    })

    test('clears the filter when clicking an already-active legend class', () => {
        const activeLayer = {
            ...layer,
            dataFilters: { legend: ['High'] },
        }
        const store = mockStore({ dataTable: 'layer1', aggregations: {} })
        render(
            <Provider store={store}>
                <OverlayCard layer={activeLayer} />
            </Provider>
        )

        fireEvent.click(screen.getByText('High'))

        expect(store.getActions()).toContainEqual({
            type: 'DATA_FILTER_CLEAR',
            layerId: 'layer1',
            fieldId: 'legend',
        })
    })

    test('does not wire legend clicks for non-thematic layers', () => {
        const facilityLayer = { ...layer, layer: 'facility' }
        const store = mockStore({ dataTable: null, aggregations: {} })
        render(
            <Provider store={store}>
                <OverlayCard layer={facilityLayer} />
            </Provider>
        )

        fireEvent.click(screen.getByText('High'))

        expect(store.getActions()).toEqual([])
    })
})
