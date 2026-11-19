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
                name="Event ID"
                dataKey="id"
                filterType={filterType}
                filter={filter}
            />
        </Provider>
    )
    fireEvent.click(screen.getByTestId('data-table-filter-button-id'))
    await screen.findByTestId('data-table-filter-popover')
    return store
}

const typeInto = (dataTest, text) =>
    fireEvent.change(screen.getByTestId(dataTest).querySelector('input'), {
        target: { value: text },
    })

const typeText = (text) => typeInto('data-table-filter-value', text)

const applyButton = () => screen.getByTestId('data-table-filter-apply')

const CONTAINS_BO = {
    type: 'text',
    operator: 'contains',
    value: 'bo',
    excluded: [''],
}

describe('FilterButton', () => {
    test('applies the typed text as a "Contains" condition, which leaves out the rows without a value', async () => {
        const store = await renderButton()

        typeText('bo')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            {
                type: DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'id',
                filter: CONTAINS_BO,
            },
        ])
        expect(
            screen.queryByTestId('data-table-filter-popover')
        ).not.toBeInTheDocument()
    })

    test('cannot apply the filter the column already has', async () => {
        await renderButton(CONTAINS_BO)

        expect(applyButton()).toBeDisabled()

        typeText('ko')
        expect(applyButton()).not.toBeDisabled()
    })

    test('applying an emptied text clears the column filter', async () => {
        const store = await renderButton(CONTAINS_BO)

        typeText('')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            { type: DATA_FILTER_CLEAR, layerId: 'layer1', fieldId: 'id' },
        ])
    })

    test('keeps the values already unchecked in the column filter', async () => {
        const store = await renderButton({ ...CONTAINS_BO, excluded: ['x'] })

        typeText('ko')
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter.excluded).toEqual(['x'])
    })

    test('clears the column filter', async () => {
        const store = await renderButton(CONTAINS_BO)

        fireEvent.click(screen.getByTestId('data-table-filter-clear'))

        expect(store.getActions()).toEqual([
            { type: DATA_FILTER_CLEAR, layerId: 'layer1', fieldId: 'id' },
        ])
    })
})

describe('FilterButton on a number column', () => {
    const range = (value, value2) => ({
        type: 'number',
        operator: 'between',
        value,
        value2,
        excluded: [''],
    })

    test('applies the two typed numbers as a "Between" condition', async () => {
        const store = await renderButton(undefined, 'number')

        typeInto('data-table-filter-value', '1')
        typeInto('data-table-filter-value2', '5')
        fireEvent.click(applyButton())

        expect(store.getActions()).toEqual([
            {
                type: DATA_FILTER_SET,
                layerId: 'layer1',
                fieldId: 'id',
                filter: range('1', '5'),
            },
        ])
    })

    test('"Between" needs both numbers before it can be applied', async () => {
        await renderButton(range('1', '5'), 'number')

        typeInto('data-table-filter-value2', '')

        expect(applyButton()).toBeDisabled()
        expect(screen.getByText('Fill in both values')).toBeInTheDocument()
    })

    test('numbers in reverse order show why they cannot be applied', async () => {
        await renderButton(range('1', '5'), 'number')

        typeInto('data-table-filter-value2', '0')

        expect(applyButton()).toBeDisabled()
        expect(
            screen.getByText('The second number must be greater than the first')
        ).toBeInTheDocument()
    })
})
