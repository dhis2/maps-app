import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_CLEAR,
    DATA_FILTERS_CLEAR_ALL,
} from '../../../../constants/actionTypes.js'
import ActiveFiltersBar from '../ActiveFiltersBar.jsx'

const mockStore = configureMockStore()

const HEADERS = [
    {
        name: 'Org unit',
        dataKey: 'orgUnitOwn',
        type: 'string',
        filterType: 'options',
    },
    { name: 'Value', dataKey: 'rawValue', type: 'number' },
    { name: 'Event date', dataKey: 'eventdate', type: 'date' },
    { name: 'Name', dataKey: 'name', type: 'string' },
]

const NAMES = { 'a/bo': 'Bo', 'a/kono': 'Kono', 'a/kenema': 'Kenema' }

const getColumn = () => ({
    options: [],
    counts: new Map(),
    formatValue: (value) => NAMES[value] ?? value,
})

const renderBar = (filters) => {
    const store = mockStore({})
    const { container } = render(
        <Provider store={store}>
            <ActiveFiltersBar
                layerId="layer1"
                filters={filters}
                headers={HEADERS}
                getColumn={getColumn}
            />
        </Provider>
    )
    return { store, container }
}

const chipText = (dataKey) =>
    screen.getByTestId(`data-table-filter-chip-${dataKey}`).textContent

describe('ActiveFiltersBar', () => {
    test('shows nothing without filters', () => {
        const { container } = renderBar({})
        expect(container).toBeEmptyDOMElement()
    })

    test('shows each filter as a chip, values read as in the table', () => {
        renderBar({
            orgUnitOwn: {
                type: 'options',
                values: ['a/bo', 'a/kono', 'a/kenema'],
            },
            rawValue: {
                type: 'number',
                operator: 'between',
                value: '1',
                value2: '5',
            },
            eventdate: {
                type: 'date',
                operator: 'between',
                from: '2024-01-01',
            },
            name: { type: 'text', operator: 'notEmpty' },
        })

        expect(chipText('orgUnitOwn')).toBe('Org unit Bo, Kono +1')
        expect(chipText('rawValue')).toBe('Value 1 – 5')
        expect(chipText('eventdate')).toBe('Event date from 2024-01-01')
        expect(chipText('name')).toBe('Name is not empty')
    })

    test('removing a chip clears its column filter', () => {
        const { store } = renderBar({
            rawValue: { type: 'number', operator: 'gt', value: '5' },
        })
        expect(chipText('rawValue')).toBe('Value > 5')

        fireEvent.click(
            screen.getByTestId('data-table-filter-chip-rawValue-remove')
        )

        expect(store.getActions()).toEqual([
            { type: DATA_FILTER_CLEAR, layerId: 'layer1', fieldId: 'rawValue' },
        ])
    })

    test('clicking a chip opens its column filter', async () => {
        renderBar({ name: { type: 'text', operator: 'contains', value: 'bo' } })

        fireEvent.click(screen.getByTestId('data-table-filter-chip-name'))

        expect(
            await screen.findByTestId('data-table-filter-popover')
        ).toBeInTheDocument()
        expect(
            screen
                .getByTestId('data-table-filter-text-input')
                .querySelector('input')
        ).toHaveValue('bo')
    })

    test('clear all removes every filter of the layer', () => {
        const { store } = renderBar({
            name: { type: 'text', operator: 'empty' },
        })

        fireEvent.click(screen.getByTestId('data-table-filters-clear-all'))

        expect(store.getActions()).toEqual([
            { type: DATA_FILTERS_CLEAR_ALL, layerId: 'layer1' },
        ])
    })
})
