import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import DataTable from '../DataTable.jsx'
import { useTableData } from '../useTableData.js'

jest.mock('../useTableData.js', () => ({ useTableData: jest.fn() }))
jest.mock('../useColumnWidths.js', () => ({
    useColumnWidths: () => ({
        headerRowRef: { current: null },
        columnWidths: [],
    }),
}))
jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({ systemSettings: {} }),
}))

const mockStore = configureMockStore()

const ACTIVE_FILL = 'var(--colors-blue700)'

const HEADERS = [
    { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
    { name: 'Value', dataKey: 'rawValue', type: 'number' },
    {
        name: 'Legend',
        dataKey: 'legend',
        type: 'string',
        filterView: 'values',
    },
    { name: 'Event date', dataKey: 'eventdate', type: 'date' },
    {
        name: 'Org unit hierarchy',
        dataKey: 'orgUnitPath',
        type: 'orgUnit',
        renderer: 'renderorgunit',
    },
    { name: 'Untyped', dataKey: 'untyped' },
]

const renderTable = () =>
    render(
        <Provider
            store={mockStore({
                map: { mapViews: [{ id: 'layer1', layer: 'thematic' }] },
                dataTable: 'layer1',
                feature: null,
            })}
        >
            <DataTable availableWidth={800} />
        </Provider>
    )

const lastSorting = () => {
    const { sortField, sortDirection } = useTableData.mock.lastCall[0]
    return { sortField, sortDirection }
}

const sortButton = (name) =>
    screen.getByRole('button', { name: `Sort by ${name}` })

const activeArrows = (name) =>
    [...sortButton(name).querySelectorAll('polygon')]
        .filter((p) => p.getAttribute('fill') === ACTIVE_FILL)
        .map((p) => p.getAttribute('points'))

const UP_ARROW = '4 7 12 7 8 2'
const DOWN_ARROW = '4 9 12 9 8 14'

beforeEach(() => {
    useTableData.mockReturnValue({
        headers: HEADERS,
        rows: [],
        isLoading: false,
        error: null,
        totalCount: 0,
        filteredCount: 0,
        columnOptions: {},
        orgUnitIdToName: new Map(),
        filterRows: [],
    })
})

describe('DataTable column headers', () => {
    test('show each column name with a sort button', () => {
        renderTable()
        HEADERS.forEach(({ name }) => {
            expect(screen.getByText(name)).toBeInTheDocument()
            expect(sortButton(name)).toHaveAttribute(
                'data-test',
                `data-table-column-sort-button-${name}`
            )
        })
    })

    test('every typed column gets a filter button, the org unit hierarchy included; untyped columns get none', () => {
        renderTable()
        const filterButton = (dataKey) =>
            screen.queryByTestId(`data-table-filter-button-${dataKey}`)

        for (const dataKey of [
            'orgUnitOwn',
            'rawValue',
            'legend',
            'eventdate',
            'orgUnitPath',
        ]) {
            expect(filterButton(dataKey)).toBeEnabled()
        }
        expect(filterButton('untyped')).not.toBeInTheDocument()
    })

    test('put the filter button between the column name and the sort button', () => {
        renderTable()
        const header = sortButton('Org unit').closest('th')
        const buttons = within(header).getAllByRole('button')

        expect(buttons.map((b) => b.getAttribute('data-test'))).toEqual([
            'data-table-filter-button-orgUnitOwn',
            'data-table-column-sort-button-Org unit',
        ])
    })

    test('highlight the arrow of the sort direction on the sorted column only', () => {
        renderTable()
        expect(activeArrows('Value')).toEqual([])

        fireEvent.click(sortButton('Value'))
        expect(activeArrows('Value')).toEqual([UP_ARROW])
        expect(activeArrows('Org unit')).toEqual([])

        fireEvent.click(sortButton('Value'))
        expect(activeArrows('Value')).toEqual([DOWN_ARROW])

        fireEvent.click(sortButton('Value'))
        expect(activeArrows('Value')).toEqual([])
    })

    test('sorting starts by the name field, ascending', () => {
        renderTable()
        expect(lastSorting()).toEqual({
            sortField: 'name',
            sortDirection: 'asc',
        })
    })

    test('the sort button sorts by its column, ascending then descending, then back to layer order', () => {
        renderTable()
        const button = sortButton('Value')

        fireEvent.click(button)
        expect(lastSorting()).toEqual({
            sortField: 'rawValue',
            sortDirection: 'asc',
        })

        fireEvent.click(button)
        expect(lastSorting()).toEqual({
            sortField: 'rawValue',
            sortDirection: 'desc',
        })

        fireEvent.click(button)
        expect(lastSorting()).toEqual({
            sortField: null,
            sortDirection: 'asc',
        })
    })
})
