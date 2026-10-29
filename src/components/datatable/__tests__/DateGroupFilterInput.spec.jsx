import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { VirtuosoMockContext } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_SET,
    DATA_FILTER_CLEAR,
} from '../../../constants/actionTypes.js'
import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    DATE_GROUPS_GRANULARITY,
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_TIME,
} from '../../../constants/dataTable.js'
import DateGroupFilterInput from '../DateGroupFilterInput.jsx'

const mockStore = configureMockStore()

const DATETIME_VALUES = [
    { value: '2023-05-15 09:00:00.0' },
    { value: '2023-05-15 14:00:00.0' },
    { value: '2024-01-01 00:00:00.0' },
]

const renderDateGroupFilter = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 28 }}
            >
                <DateGroupFilterInput
                    dataKey="eventdate"
                    name="Event date"
                    layerId="layer1"
                    type={TYPE_DATETIME}
                    options={DATETIME_VALUES}
                    {...props}
                />
            </VirtuosoMockContext.Provider>
        </Provider>
    )
    return { ...result, store }
}

const getInput = () =>
    screen
        .getByTestId('data-table-column-filter-search-Event date')
        .querySelector('input')

const openPopover = () => fireEvent.focus(getInput())

describe('DateGroupFilterInput - default (collapsed) tree', () => {
    test('shows only root (year) nodes by default', () => {
        renderDateGroupFilter()
        openPopover()
        expect(screen.getByLabelText('2023')).toBeInTheDocument()
        expect(screen.getByLabelText('2024')).toBeInTheDocument()
        expect(screen.queryByLabelText('May')).not.toBeInTheDocument()
    })

    test('expanding a year reveals its months', () => {
        renderDateGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        expect(screen.getByLabelText('May')).toBeInTheDocument()
    })

    test('expanding down to the day level reveals hours for a DATETIME column, and the exact value under an hour', () => {
        renderDateGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        fireEvent.click(screen.getByLabelText('Expand May'))
        fireEvent.click(screen.getByLabelText('Expand 15 Monday'))
        expect(screen.getByLabelText('09:00')).toBeInTheDocument()
        expect(screen.getByLabelText('14:00')).toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Expand 09:00'))
        expect(screen.getByLabelText('2023-05-15 09:00')).toBeInTheDocument()
    })

    test('collapsing a year hides its months again', () => {
        renderDateGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        expect(screen.getByLabelText('May')).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText('Collapse 2023'))
        expect(screen.queryByLabelText('May')).not.toBeInTheDocument()
    })
})

describe('DateGroupFilterInput - selection dispatches', () => {
    test('checking a year dispatches the full date-group filter shape', () => {
        const { store } = renderDateGroupFilter()
        openPopover()
        fireEvent.click(screen.getByLabelText('2023'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
    })

    test('unchecking the only selected prefix dispatches DATA_FILTER_CLEAR', () => {
        const { store } = renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('2023'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'eventdate',
        })
    })

    test('checking a month drops the now-redundant year-level ancestor selection scenario in reverse: checking a day under an unrelated selected month keeps both', () => {
        const { store } = renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2024'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        fireEvent.click(screen.getByLabelText('May'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2024', '2023-05'],
            },
        })
    })
})

describe('DateGroupFilterInput - tri-state checkbox rendering', () => {
    test('a year is checked when its own prefix is selected', () => {
        renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        expect(screen.getByLabelText('2023')).toBeChecked()
    })

    test('a year is indeterminate when only a descendant prefix is selected', () => {
        renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023-05'],
            },
        })
        openPopover()
        const yearCheckbox = screen.getByLabelText('2023')
        expect(yearCheckbox.indeterminate).toBe(true)
        expect(yearCheckbox.checked).toBe(false)
    })

    test('a month is checked (not indeterminate) when its ancestor year is selected', () => {
        renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        const monthCheckbox = screen.getByLabelText('May')
        expect(monthCheckbox.checked).toBe(true)
        expect(monthCheckbox.indeterminate).toBe(false)
    })
})

describe('DateGroupFilterInput - "Any value" / "No value"', () => {
    test('"No value" is only shown when the options include the not-set sentinel', () => {
        renderDateGroupFilter()
        openPopover()
        expect(screen.queryByLabelText('No value')).not.toBeInTheDocument()
    })

    test('checking "Any value" dispatches the sentinel and clears prior selections', () => {
        const { store } = renderDateGroupFilter({
            options: [...DATETIME_VALUES, { value: SENTINEL_NO_VALUE }],
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Any value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: [SENTINEL_ANY_VALUE],
            },
        })
    })

    test('checking "No value" preserves an existing tree selection alongside it', () => {
        const { store } = renderDateGroupFilter({
            options: [...DATETIME_VALUES, { value: SENTINEL_NO_VALUE }],
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('No value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023', SENTINEL_NO_VALUE],
            },
        })
    })

    test('clicking a tree node while "Any value" is active is a no-op (v1 scope boundary)', () => {
        const { store } = renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: [SENTINEL_ANY_VALUE],
            },
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('2023'))
        expect(store.getActions()).toEqual([])
    })
})

describe('DateGroupFilterInput - clearing via the input’s clear ("x") button', () => {
    test('clearing the closed trigger (showing "N selected") clears the whole filter', () => {
        const { store } = renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        expect(getInput()).toHaveValue('1 selected')
        fireEvent.change(getInput(), { target: { value: '' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'eventdate',
        })
    })

    test('clearing a typed search narrow while a selection is active also clears the selection (mirrors the flat filter variant)', () => {
        const { store } = renderDateGroupFilter({
            filterValue: {
                granularity: DATE_GROUPS_GRANULARITY,
                prefixes: ['2023'],
            },
        })
        openPopover()
        fireEvent.change(getInput(), { target: { value: '2023-05' } })
        expect(screen.queryByLabelText('2024')).not.toBeInTheDocument()

        fireEvent.change(getInput(), { target: { value: '' } })
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_CLEAR,
            layerId: 'layer1',
            fieldId: 'eventdate',
        })
    })

    test('clearing empty search text with no active filter dispatches nothing', () => {
        const { store } = renderDateGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: '' } })
        expect(store.getActions()).toEqual([])
    })
})

describe('DateGroupFilterInput - search', () => {
    test('typing narrows to matching branches and auto-expands their ancestors', () => {
        renderDateGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: '2023-05' } })
        expect(screen.getByLabelText('2023')).toBeInTheDocument()
        expect(screen.getByLabelText('May')).toBeInTheDocument()
        expect(screen.queryByLabelText('2024')).not.toBeInTheDocument()
    })

    test('typed letters are stripped, so a matching numeric prefix still narrows even amid disallowed characters', () => {
        renderDateGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: 'x2023-05y' } })
        expect(getInput()).toHaveValue('2023-05')
        expect(screen.getByLabelText('May')).toBeInTheDocument()
        expect(screen.queryByLabelText('2024')).not.toBeInTheDocument()
    })

    test('typing text with no exact tree match shows a live-applying "Contains" custom filter row', () => {
        const { store } = renderDateGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: '2023-05-15 09:0' } })
        expect(
            screen.getByTestId('data-table-column-filter-custom-Event date')
        ).toBeInTheDocument()
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: '2023-05-15 09:0',
        })
    })

    test('stays shown and keeps live-applying even when the typed text exactly matches a tree node prefix (e.g. a full year)', () => {
        const { store } = renderDateGroupFilter()
        openPopover()
        fireEvent.change(getInput(), { target: { value: '202' } })
        fireEvent.change(getInput(), { target: { value: '2023' } })
        expect(
            screen.getByTestId('data-table-column-filter-custom-Event date')
        ).toBeInTheDocument()
        expect(store.getActions()).toContainEqual({
            type: DATA_FILTER_SET,
            layerId: 'layer1',
            fieldId: 'eventdate',
            filter: '2023',
        })
    })
})

describe('DateGroupFilterInput - granularity variants', () => {
    test('TYPE_DATE stops the Y/M/D hierarchy at the day level: real values (not hour buckets) appear under it, formatted like the column', () => {
        renderDateGroupFilter({
            type: TYPE_DATE,
            options: [
                { value: '2023-05-15 09:00:00.0' },
                { value: '2023-05-15 14:00:00.0' },
            ],
        })
        openPopover()
        fireEvent.click(screen.getByLabelText('Expand 2023'))
        fireEvent.click(screen.getByLabelText('Expand May'))
        expect(screen.getByLabelText('15 Monday')).toBeInTheDocument()
        expect(screen.queryByLabelText('09:00')).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Expand 15 Monday'))
        expect(screen.getAllByLabelText('2023-05-15')).toHaveLength(2)
    })

    test('TYPE_TIME shows a flat hour-only list, no year/month/day levels, with real values under each hour', () => {
        renderDateGroupFilter({
            type: TYPE_TIME,
            options: [{ value: '09:00:00' }, { value: '14:30:00' }],
        })
        openPopover()
        expect(screen.getByLabelText('09:00')).toBeInTheDocument()
        expect(screen.getByLabelText('14:00')).toBeInTheDocument()
        expect(screen.queryByLabelText('2023')).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Expand 09:00'))
        expect(screen.getByLabelText('09:00:00')).toBeInTheDocument()
    })
})
