import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_CLEAR,
    DATA_FILTERS_CLEAR_ALL,
} from '../../../../constants/actionTypes.js'
import ActiveFiltersBar from '../ActiveFiltersBar.jsx'

jest.mock('../../../../hooks/useOptionSet.js', () => () => ({
    optionSet: null,
}))

const mockStore = configureMockStore()

const HEADERS = [
    {
        name: 'Org unit',
        dataKey: 'orgUnitOwn',
        type: 'string',
        renderer: 'renderorgunitname',
        filterView: 'values',
    },
    { name: 'Value', dataKey: 'rawValue', type: 'number' },
    { name: 'Event date', dataKey: 'eventdate', type: 'date' },
    { name: 'Time', dataKey: 'time', type: 'time' },
    { name: 'Name', dataKey: 'name', type: 'string' },
]

const COLUMN = {
    rows: [{ name: 'Bo' }, { name: 'Kono' }],
    filters: {},
    orgUnitIdToName: new Map([
        ['bo', 'Bo'],
        ['kono', 'Kono'],
        ['kenema', 'Kenema'],
    ]),
}

const renderBar = (filters) => {
    const store = mockStore({})
    const { container } = render(
        <Provider store={store}>
            <ActiveFiltersBar
                layerId="layer1"
                filters={filters}
                headers={HEADERS}
                column={COLUMN}
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

    test('sums up each filter in a chip: its condition and its unchecked values, read as in the table', () => {
        renderBar({
            orgUnitOwn: { type: 'text', excluded: ['bo', 'kono', 'kenema'] },
            rawValue: {
                type: 'number',
                operator: 'between',
                value: '1',
                value2: '5',
                excluded: [],
            },
            eventdate: {
                type: 'date',
                operator: 'before',
                value: '2024-01-01',
                excluded: [''],
            },
            time: {
                type: 'time',
                operator: 'on',
                value: '08:10',
                excluded: [''],
            },
            name: {
                type: 'text',
                operator: 'contains',
                value: 'bo',
                excluded: ['', 'Bombali'],
            },
        })

        expect(chipText('orgUnitOwn')).toBe('Org unit not Bo, Kono +1')
        expect(chipText('rawValue')).toBe('Value 1 – 5, or no value')
        expect(chipText('eventdate')).toBe('Event date before 2024-01-01')
        expect(chipText('time')).toBe('Time at 08:10')
        expect(chipText('name')).toBe('Name contains "bo", not Bombali')
    })

    test('a filter on "No value" alone reads "with a value"', () => {
        renderBar({ name: { type: 'text', excluded: [''] } })
        expect(chipText('name')).toBe('Name with a value')
    })

    test('removing a chip clears its column filter', () => {
        const { store } = renderBar({
            rawValue: {
                type: 'number',
                operator: 'gt',
                value: '5',
                excluded: [''],
            },
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
        renderBar({
            name: {
                type: 'text',
                operator: 'contains',
                value: 'bo',
                excluded: [''],
            },
        })

        fireEvent.click(screen.getByTestId('data-table-filter-chip-name'))

        expect(
            await screen.findByTestId('data-table-filter-popover')
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-filter-value').querySelector('input')
        ).toHaveValue('bo')
    })

    test('clear all removes every filter of the layer', () => {
        const { store } = renderBar({ name: { type: 'text', excluded: [''] } })

        fireEvent.click(screen.getByTestId('data-table-filters-clear-all'))

        expect(store.getActions()).toEqual([
            { type: DATA_FILTERS_CLEAR_ALL, layerId: 'layer1' },
        ])
    })
})
