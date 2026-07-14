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
