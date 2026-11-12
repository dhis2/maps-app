import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_CLEAR,
    DATA_FILTER_SET,
} from '../../../../constants/actionTypes.js'
import FilterButton from '../FilterButton.jsx'

const mockStore = configureMockStore()

const renderButton = async (filter, filterType = 'text') => {
    const store = mockStore({})
    render(
        <Provider store={store}>
            <FilterButton
                layerId="layer1"
                name="Org unit"
                dataKey="name"
                filterType={filterType}
                filter={filter}
            />
        </Provider>
    )
    fireEvent.click(screen.getByTestId('data-table-filter-button-name'))
    await screen.findByTestId('data-table-filter-popover')
    return store
}

const typeInto = (dataTest, text) =>
    fireEvent.change(screen.getByTestId(dataTest).querySelector('input'), {
        target: { value: text },
    })

const typeText = (text) => typeInto('data-table-filter-text-input', text)

const applyButton = () => screen.getByTestId('data-table-filter-apply')

describe('FilterButton', () => {
    test('applies the text typed in the popover as the column filter', async () => {
        const store = await renderButton()

        typeText('bo')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            {
                type: DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'name',
                filter: { type: 'text', operator: 'contains', value: 'bo' },
            },
        ])
        expect(
            screen.queryByTestId('data-table-filter-popover')
        ).not.toBeInTheDocument()
    })

    test('cannot apply the filter the column already has', async () => {
        await renderButton({ type: 'text', operator: 'contains', value: 'bo' })

        expect(applyButton()).toBeDisabled()

        typeText('ko')
        expect(applyButton()).not.toBeDisabled()
    })

    test('applying an emptied text clears the column filter', async () => {
        const store = await renderButton({
            type: 'text',
            operator: 'contains',
            value: 'bo',
        })

        typeText('')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            { type: DATA_FILTER_CLEAR, layerId: 'layer1', fieldId: 'name' },
        ])
    })

    test('clears the column filter', async () => {
        const store = await renderButton({
            type: 'text',
            operator: 'contains',
            value: 'bo',
        })

        fireEvent.click(screen.getByTestId('data-table-filter-clear'))

        expect(store.getActions()).toEqual([
            { type: DATA_FILTER_CLEAR, layerId: 'layer1', fieldId: 'name' },
        ])
    })

    test('is empty takes no text', async () => {
        await renderButton({ type: 'text', operator: 'empty' })

        expect(
            screen.queryByTestId('data-table-filter-text-input')
        ).not.toBeInTheDocument()
    })
})

describe('FilterButton on a number column', () => {
    const range = (value, value2) => ({
        type: 'number',
        operator: 'between',
        value,
        value2,
    })

    test('applies a number greater than the typed value', async () => {
        const store = await renderButton(undefined, 'number')

        typeInto('data-table-filter-number-value', '5')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            {
                type: DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'name',
                filter: { type: 'number', operator: 'gt', value: '5' },
            },
        ])
    })

    test('a range needs both bounds before it can be applied', async () => {
        await renderButton(range('1', '5'), 'number')

        typeInto('data-table-filter-number-value2', '')
        expect(applyButton()).toBeDisabled()
    })

    test('a range with its bounds reversed shows why it cannot be applied', async () => {
        await renderButton(range('1', '5'), 'number')

        typeInto('data-table-filter-number-value2', '0')

        expect(applyButton()).toBeDisabled()
        expect(
            screen.getByText('Max must be greater than Min')
        ).toBeInTheDocument()
    })
})

describe('FilterButton on a date column', () => {
    test('applies a range of days', async () => {
        const store = await renderButton(undefined, 'date')

        typeInto('data-table-filter-date-from', '2024-01-01')
        typeInto('data-table-filter-date-to', '2024-03-31')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            {
                type: DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'name',
                filter: {
                    type: 'date',
                    operator: 'between',
                    from: '2024-01-01',
                    to: '2024-03-31',
                },
            },
        ])
    })

    test('a range ending before it starts shows why it cannot be applied', async () => {
        await renderButton(
            { type: 'date', operator: 'between', from: '2024-05-01' },
            'date'
        )

        typeInto('data-table-filter-date-to', '2024-04-01')

        expect(applyButton()).toBeDisabled()
        expect(screen.getByText('To must be after From')).toBeInTheDocument()
    })
})
