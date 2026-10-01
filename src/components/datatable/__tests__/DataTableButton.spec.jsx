import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { THEMATIC_LAYER, EXTERNAL_LAYER } from '../../../constants/layers.js'
import DataTableButton from '../DataTableButton.jsx'

const mockStore = configureMockStore()

const layer = (id, overrides = {}) => ({
    id,
    name: id,
    layer: THEMATIC_LAYER,
    isLoaded: true,
    data: [{}],
    ...overrides,
})

const renderButton = ({ dataTable, mapViews }) => {
    const store = mockStore({
        dataTable,
        map: { mapViews },
    })
    const result = render(
        <Provider store={store}>
            <DataTableButton />
        </Provider>
    )
    return { ...result, store }
}

const CLOSED = { openIds: [] }

describe('DataTableButton', () => {
    test('is disabled when the map has no eligible layers', () => {
        renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a', { layer: EXTERNAL_LAYER })],
        })
        expect(screen.getByText('Data table')).toBeDisabled()
    })

    test('opens the first eligible layer when none is open yet', () => {
        const { store } = renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_TOGGLE', id: 'a' },
        ])
    })

    test('closes the panel when a table is already open', () => {
        const { store } = renderButton({
            dataTable: { openIds: ['a'], isPanelVisible: true },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_CLOSE' }])
    })

    test('reopens (without changing what is open) when a table was open but the panel is hidden', () => {
        const { store } = renderButton({
            dataTable: { openIds: ['a'], isPanelVisible: false },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_OPEN' }])
    })
})
