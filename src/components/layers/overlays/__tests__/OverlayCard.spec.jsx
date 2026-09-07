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

const mockStore = configureMockStore()

describe('OverlayCard', () => {
    const renderCard = (name, layerOverrides = {}) => {
        const store = mockStore({
            dataTable: { openIds: [] },
            aggregations: {},
        })
        const rendered = render(
            <Provider store={store}>
                <OverlayCard
                    layer={{
                        id: 'layer1',
                        name,
                        layer: 'thematic',
                        isLoaded: true,
                        isExpanded: true,
                        isVisible: true,
                        opacity: 1,
                        ...layerOverrides,
                    }}
                />
            </Provider>
        )
        return { ...rendered, store }
    }

    test('shows the raw layer name with special characters in the removal alert', async () => {
        renderCard('Children < 5y & "others"')

        fireEvent.click(screen.getByLabelText('Toggle layer menu'))
        fireEvent.click(await screen.findByText('Remove layer'))

        expect(mockShow).toHaveBeenCalledWith({
            msg: 'Children < 5y & "others" deleted.',
        })
    })

    test('does not show a clear-filters button when the layer has no active dataFilters', () => {
        const { container } = renderCard('Layer 1')
        expect(
            container.querySelector(
                '[data-test="layer-clear-data-filters-button"]'
            )
        ).not.toBeInTheDocument()
    })

    test('shows a clear-filters button when the layer has active dataFilters, and dispatches clearDataFilters on click', () => {
        const { container, store } = renderCard('Layer 1', {
            dataFilters: { population: '>100' },
        })

        const button = container.querySelector(
            '[data-test="layer-clear-data-filters-button"]'
        )
        expect(button).toBeInTheDocument()

        fireEvent.click(button)

        expect(store.getActions()).toContainEqual({
            type: 'DATA_FILTERS_CLEAR_ALL',
            layerId: 'layer1',
        })
    })
})
