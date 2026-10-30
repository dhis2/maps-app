import { render, screen, fireEvent } from '@testing-library/react'
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
jest.mock('../FilterInput.jsx', () => {
    const FilterInputMock = () => null
    FilterInputMock.displayName = 'FilterInputMock'
    return FilterInputMock
})

const mockStore = configureMockStore()

const HEADERS = [
    { name: 'Org unit', dataKey: 'orgUnitOwn', type: 'string' },
    { name: 'Value', dataKey: 'rawValue', type: 'number' },
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
    })
})

describe('DataTable column headers', () => {
    test('show each column name with a sort button', () => {
        renderTable()
        expect(screen.getByText('Org unit')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Sort by Value' })
        ).toHaveAttribute('data-test', 'data-table-column-sort-button-Value')
    })

    test('sorting starts by name, ascending', () => {
        renderTable()
        expect(lastSorting()).toEqual({
            sortField: 'name',
            sortDirection: 'asc',
        })
    })

    test('the sort button sorts by its column, ascending then descending, then back to layer order', () => {
        renderTable()
        const button = screen.getByRole('button', { name: 'Sort by Value' })

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
