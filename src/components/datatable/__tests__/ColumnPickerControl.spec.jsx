import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { DATA_TABLE_COLUMN_CONFIG_SET } from '../../../constants/actionTypes.js'
import {
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    RENDERING_STRATEGY_TIMELINE,
} from '../../../constants/layers.js'
import ColumnPickerControl from '../controls/ColumnPickerControl.jsx'

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
            <ColumnPickerControl
                layerId="layer1"
                allHeaders={headers}
                {...props}
            />
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
                extraPeriodIds: [],
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
                extraPeriodIds: [],
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
                extraPeriodIds: [],
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
                extraPeriodIds: [],
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
            // Excludes the bulk "select all" checkbox, which isn't
            // wrapped in a <label> and isn't part of the column order.
            .filter(Boolean)
        expect(labels).toEqual(['Legend', 'Name', 'Value'])
    })
})

describe('ColumnPicker bulk actions', () => {
    test('the select-all checkbox is checked when every column is already visible', () => {
        renderColumnPicker()
        openPicker()
        expect(
            screen.getByTestId('data-table-column-picker-select-all')
        ).toBeChecked()
    })

    test('the select-all checkbox is unchecked when some columns are hidden', () => {
        renderColumnPicker({ columnConfig: { visibleKeys: ['name'] } })
        openPicker()
        expect(
            screen.getByTestId('data-table-column-picker-select-all')
        ).not.toBeChecked()
    })

    test('checking it when some columns are hidden shows every column, leaving pinning/order untouched', () => {
        const { store } = renderColumnPicker({
            columnConfig: { visibleKeys: ['name'], pinnedKeys: ['legend'] },
        })
        openPicker()
        fireEvent.click(
            screen.getByTestId('data-table-column-picker-select-all')
        )
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: ['legend'],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: [],
            },
        })
    })

    test('unchecking it when every column is visible hides them all, leaving pinnedKeys untouched', () => {
        const { store } = renderColumnPicker({
            columnConfig: { pinnedKeys: ['legend'] },
        })
        openPicker()
        fireEvent.click(
            screen.getByTestId('data-table-column-picker-select-all')
        )
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: [],
                pinnedKeys: ['legend'],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: [],
            },
        })
    })

    test("reverse selection swaps every column's visibility, leaving pinning/order untouched", () => {
        const { store } = renderColumnPicker({
            columnConfig: { visibleKeys: ['name'], pinnedKeys: ['legend'] },
        })
        openPicker()
        fireEvent.click(screen.getByTestId('data-table-column-picker-reverse'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['rawValue', 'legend'],
                pinnedKeys: ['legend'],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: [],
            },
        })
    })

    test('reset to defaults is disabled when there is no columnConfig yet', () => {
        renderColumnPicker()
        openPicker()
        expect(
            screen.getByTestId('data-table-column-picker-reset')
        ).toBeDisabled()
    })

    test('reset to defaults dispatches an undefined config', () => {
        const { store } = renderColumnPicker({
            columnConfig: { visibleKeys: ['name'] },
        })
        openPicker()
        fireEvent.click(screen.getByTestId('data-table-column-picker-reset'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: undefined,
        })
    })
})

describe('ColumnPicker search box visibility', () => {
    test('is hidden when the column list is short enough to fit without scrolling', () => {
        renderColumnPicker()
        openPicker()
        expect(
            screen.queryByTestId('data-table-column-picker-search')
        ).not.toBeInTheDocument()
    })

    test('is shown when the column list overflows its max-height', () => {
        const scrollHeightSpy = jest
            .spyOn(Element.prototype, 'scrollHeight', 'get')
            .mockReturnValue(500)
        const clientHeightSpy = jest
            .spyOn(Element.prototype, 'clientHeight', 'get')
            .mockReturnValue(260)
        renderColumnPicker()
        openPicker()
        expect(
            screen.getByTestId('data-table-column-picker-search')
        ).toBeInTheDocument()
        scrollHeightSpy.mockRestore()
        clientHeightSpy.mockRestore()
    })
})

describe('ColumnPicker search', () => {
    let scrollHeightSpy
    let clientHeightSpy

    beforeEach(() => {
        scrollHeightSpy = jest
            .spyOn(Element.prototype, 'scrollHeight', 'get')
            .mockReturnValue(500)
        clientHeightSpy = jest
            .spyOn(Element.prototype, 'clientHeight', 'get')
            .mockReturnValue(260)
    })

    afterEach(() => {
        scrollHeightSpy.mockRestore()
        clientHeightSpy.mockRestore()
    })

    const search = (value) =>
        fireEvent.change(
            screen.getByTestId('data-table-column-picker-search'),
            { target: { value } }
        )

    test('filters which columns are shown by name', () => {
        renderColumnPicker()
        openPicker()
        search('val')
        expect(screen.getByLabelText('Value')).toBeInTheDocument()
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Legend')).not.toBeInTheDocument()
    })

    test('matches case-insensitively', () => {
        renderColumnPicker()
        openPicker()
        search('NAME')
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.queryByLabelText('Value')).not.toBeInTheDocument()
    })

    test('placeholder text is just "Search"', () => {
        renderColumnPicker()
        openPicker()
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    })

    test('resets when the popover is closed and reopened', () => {
        renderColumnPicker()
        openPicker()
        search('val')
        openPicker() // closes
        openPicker() // reopens
        expect(
            screen.getByTestId('data-table-column-picker-search')
        ).toHaveValue('')
    })

    test('the select-all checkbox still targets every column, not just the filtered ones', () => {
        const { store } = renderColumnPicker({
            columnConfig: { visibleKeys: ['name'] },
        })
        openPicker()
        search('val')
        fireEvent.click(
            screen.getByTestId('data-table-column-picker-select-all')
        )
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: [],
            },
        })
    })
})

describe('ColumnPicker periods section', () => {
    const periods = [
        { id: '202301', name: 'January 2023' },
        { id: '202302', name: 'February 2023' },
    ]

    test('is absent for a single-period (non-multi-period) layer', () => {
        renderColumnPicker({ periods })
        openPicker()
        expect(screen.queryByText('January 2023')).not.toBeInTheDocument()
    })

    test('is absent when there are no available periods', () => {
        renderColumnPicker({ renderingStrategy: RENDERING_STRATEGY_TIMELINE })
        openPicker()
        expect(screen.queryByText('Add period columns')).not.toBeInTheDocument()
    })

    test('lists available periods for a timeline layer', () => {
        renderColumnPicker({
            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            periods,
        })
        openPicker()
        expect(screen.getByText('Add period columns')).toBeInTheDocument()
        expect(screen.getByLabelText('January 2023')).not.toBeChecked()
        expect(screen.getByLabelText('February 2023')).not.toBeChecked()
    })

    test('lists available periods for a split-by-period layer too', () => {
        renderColumnPicker({
            renderingStrategy: RENDERING_STRATEGY_SPLIT_BY_PERIOD,
            periods,
        })
        openPicker()
        expect(screen.getByText('Add period columns')).toBeInTheDocument()
    })

    test('checking a period dispatches extraPeriodIds with it added', () => {
        const { store } = renderColumnPicker({
            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            periods,
        })
        openPicker()
        fireEvent.click(screen.getByLabelText('January 2023'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: ['202301'],
            },
        })
    })

    test('checking a period also adds its dataKey to an already-customized visibleKeys allowlist', () => {
        // visibleKeys, once customized, acts as an allowlist (getVisibleHeaders
        // filters out anything not in it) - the new period column's dataKey
        // must be added too, or it would never actually render.
        const { store } = renderColumnPicker({
            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            periods,
            columnConfig: { visibleKeys: ['name'] },
        })
        openPicker()
        fireEvent.click(screen.getByLabelText('January 2023'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'period_202301_rawValue'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: ['202301'],
            },
        })
    })

    test('unchecking an already-added period dispatches extraPeriodIds without it', () => {
        const { store } = renderColumnPicker({
            renderingStrategy: RENDERING_STRATEGY_TIMELINE,
            periods,
            columnConfig: { extraPeriodIds: ['202301', '202302'] },
        })
        openPicker()
        expect(screen.getByLabelText('January 2023')).toBeChecked()
        fireEvent.click(screen.getByLabelText('January 2023'))
        expect(store.getActions()).toContainEqual({
            type: DATA_TABLE_COLUMN_CONFIG_SET,
            layerId: 'layer1',
            config: {
                visibleKeys: ['name', 'rawValue', 'legend'],
                pinnedKeys: [],
                orderedKeys: ['name', 'rawValue', 'legend'],
                extraPeriodIds: ['202302'],
            },
        })
    })
})
