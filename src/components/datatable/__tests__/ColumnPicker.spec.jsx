import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { DATA_TABLE_COLUMN_CONFIG_SET } from '../../../constants/actionTypes.js'
import ColumnPicker from '../ColumnPicker.jsx'

const mockStore = configureMockStore()

const headers = [
    { name: 'Name', dataKey: 'name' },
    { name: 'Value', dataKey: 'rawValue' },
    { name: 'Legend', dataKey: 'legend' },
]

const renderColumnPicker = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <ColumnPicker layerId="layer1" allHeaders={headers} {...props} />
        </Provider>
    )
    return { ...result, store }
}

const openPicker = () =>
    fireEvent.click(screen.getByTestId('data-table-column-picker-button'))

describe('ColumnPicker trigger', () => {
    test('is disabled when there are no headers yet', () => {
        renderColumnPicker({ allHeaders: null })
        expect(
            screen.getByTestId('data-table-column-picker-button')
        ).toBeDisabled()
    })

    test('is disabled when allHeaders is an empty array', () => {
        renderColumnPicker({ allHeaders: [] })
        expect(
            screen.getByTestId('data-table-column-picker-button')
        ).toBeDisabled()
    })

    test('is enabled once headers are available', () => {
        renderColumnPicker()
        expect(
            screen.getByTestId('data-table-column-picker-button')
        ).not.toBeDisabled()
    })

    test('a click on the disabled trigger does not open the popover', () => {
        renderColumnPicker({ allHeaders: [] })
        openPicker()
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    test('opens a popover listing every column, checked by default', () => {
        renderColumnPicker()
        openPicker()
        expect(screen.getByLabelText('Name')).toBeChecked()
        expect(screen.getByLabelText('Value')).toBeChecked()
        expect(screen.getByLabelText('Legend')).toBeChecked()
    })
})

describe('ColumnPicker visibility toggling', () => {
    test('unchecking a column dispatches visibleKeys without that column, leaving order/pinning untouched', () => {
        const { store } = renderColumnPicker()
        openPicker()
        fireEvent.click(screen.getByLabelText('Value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'legend'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
            },
        })
    })

    test('rechecking a hidden column dispatches visibleKeys with it added back, leaving order/pinning untouched', () => {
        const { store } = renderColumnPicker({
            columnConfig: { visibleKeys: ['name', 'legend'] },
        })
        openPicker()
        expect(screen.getByLabelText('Value')).not.toBeChecked()
        fireEvent.click(screen.getByLabelText('Value'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'legend', 'rawValue'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
            },
        })
    })
})

describe('ColumnPicker pinning', () => {
    test('pinning a column dispatches pinnedKeys including it, leaving visibility/order untouched', () => {
        const { store } = renderColumnPicker()
        openPicker()
        fireEvent.click(
            screen.getByTestId('data-table-column-picker-pin-rawValue')
        )
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: ['rawValue'],
                orderedKeys: ['name', 'rawValue', 'legend'],
            },
        })
    })

    test('unpinning an already-pinned column dispatches pinnedKeys without it, leaving visibility/order untouched', () => {
        const { store } = renderColumnPicker({
            columnConfig: { pinnedKeys: ['rawValue'] },
        })
        openPicker()
        fireEvent.click(
            screen.getByTestId('data-table-column-picker-pin-rawValue')
        )
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
            },
        })
    })

    test('renders pinned columns first, ahead of orderedKeys', () => {
        renderColumnPicker({
            columnConfig: {
                orderedKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: ['legend'],
            },
        })
        openPicker()
        const labels = screen
            .getAllByRole('checkbox')
            .map((el) => el.closest('label')?.textContent)
        expect(labels).toEqual(['Legend', 'Name', 'Value'])
    })
})
