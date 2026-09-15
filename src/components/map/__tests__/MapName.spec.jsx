import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { useMapDirty } from '../../../hooks/useMapDirty.js'
import MapName from '../MapName.jsx'

jest.mock('../../../hooks/useMapDirty.js')

const mockStore = configureMockStore()

const renderWithState = ({ displayName, downloadMode = false }) =>
    render(
        <Provider
            store={mockStore({
                map: { displayName },
                ui: { downloadMode },
            })}
        >
            <MapName />
        </Provider>
    )

describe('MapName', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when there is no map name', () => {
        useMapDirty.mockReturnValue(false)

        const { queryByTestId } = renderWithState({ displayName: undefined })

        expect(queryByTestId('map-name')).toBeNull()
    })

    it('renders nothing in download mode', () => {
        useMapDirty.mockReturnValue(false)

        const { queryByTestId } = renderWithState({
            displayName: 'My map',
            downloadMode: true,
        })

        expect(queryByTestId('map-name')).toBeNull()
    })

    it('renders the name without a suffix when not dirty', () => {
        useMapDirty.mockReturnValue(false)

        const { getByTestId, queryByTestId } = renderWithState({
            displayName: 'My map',
        })

        expect(getByTestId('map-name')).toHaveTextContent('My map')
        expect(queryByTestId('map-name-edited')).toBeNull()
    })

    it('appends the "- Edited" suffix when dirty', () => {
        useMapDirty.mockReturnValue(true)

        const { getByTestId } = renderWithState({ displayName: 'My map' })

        expect(getByTestId('map-name-edited')).toHaveTextContent('Edited')
        expect(getByTestId('map-name')).toHaveTextContent('My map - Edited')
    })
})
