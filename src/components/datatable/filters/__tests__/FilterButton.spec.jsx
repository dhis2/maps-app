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

const renderButton = async (filter) => {
    const store = mockStore({})
    render(
        <Provider store={store}>
            <FilterButton
                layerId="layer1"
                name="Org unit"
                dataKey="name"
                filter={filter}
            />
        </Provider>
    )
    fireEvent.click(screen.getByTestId('data-table-filter-button-name'))
    await screen.findByTestId('data-table-filter-popover')
    return store
}

const typeText = (text) =>
    fireEvent.change(
        screen
            .getByTestId('data-table-filter-text-input')
            .querySelector('input'),
        { target: { value: text } }
    )

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
