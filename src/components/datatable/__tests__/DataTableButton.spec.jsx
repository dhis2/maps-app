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

const referenceLayer = (
    rows = [{ dimension: 'ou', items: [{ id: 'country1' }] }]
) => ({
    id: 'ref1',
    layer: 'combinedTableRef',
    rows,
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

const CLOSED = { openIds: [], combinedView: false }

describe('DataTableButton', () => {
    test('is disabled when the map has no eligible layers', () => {
        renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a', { layer: EXTERNAL_LAYER })],
        })
        expect(screen.getByText('Data table')).toBeDisabled()
    })

    test('opens the single layer directly when only one is eligible', () => {
        const { store } = renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_TOGGLE', id: 'a' },
        ])
    })

    test('opens the first eligible layer, not Combined, when 2+ are eligible but no reference is configured yet', () => {
        const { store } = renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_TOGGLE', id: 'a' },
        ])
    })

    test('opens Combined directly when a reference org unit set has already been configured', () => {
        const { store } = renderButton({
            dataTable: CLOSED,
            mapViews: [layer('a'), layer('b'), referenceLayer()],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
        ])
    })

    test('closes the panel when a single-layer table is already open', () => {
        const { store } = renderButton({
            dataTable: {
                openIds: ['a'],
                combinedView: false,
                isPanelVisible: true,
            },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_CLOSE' }])
    })

    test('closes the panel when Combined is already open', () => {
        const { store } = renderButton({
            dataTable: {
                openIds: [],
                combinedView: true,
                isPanelVisible: true,
            },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_CLOSE' }])
    })

    test('reopens (without changing what is open) when a single-layer table was open but the panel is hidden', () => {
        const { store } = renderButton({
            dataTable: {
                openIds: ['a'],
                combinedView: false,
                isPanelVisible: false,
            },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_OPEN' }])
    })

    test('reopens (without changing what is open) when Combined was open but the panel is hidden', () => {
        const { store } = renderButton({
            dataTable: {
                openIds: [],
                combinedView: true,
                isPanelVisible: false,
            },
            mapViews: [layer('a'), layer('b')],
        })
        fireEvent.click(screen.getByText('Data table'))
        expect(store.getActions()).toEqual([{ type: 'DATA_TABLE_OPEN' }])
    })
})
