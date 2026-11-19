import { act, render, fireEvent, screen } from '@testing-library/react'
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
                name="Event ID"
                dataKey="id"
                filterType="text"
                filter={filter}
            />
        </Provider>
    )
    fireEvent.click(screen.getByTestId('data-table-filter-button-id'))
    await screen.findByTestId('data-table-filter-popover')
    return store
}

const typeText = (text) =>
    fireEvent.change(
        screen.getByTestId('data-table-filter-value').querySelector('input'),
        { target: { value: text } }
    )

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

describe('FilterButton tooltip', () => {
    afterEach(() => jest.useRealTimers())

    test('hides its tooltip while the popover is open, so it never covers the popover', () => {
        jest.useFakeTimers()
        render(
            <Provider store={mockStore({})}>
                <FilterButton
                    layerId="layer1"
                    name="Event ID"
                    dataKey="id"
                    filterType="text"
                />
            </Provider>
        )
        const button = screen.getByTestId('data-table-filter-button-id')
        const tooltip = () => document.querySelector('.topTooltipContent')

        fireEvent.mouseOver(button)
        act(() => jest.advanceTimersByTime(300))
        expect(tooltip()).toHaveTextContent('Filter by Event ID')

        fireEvent.click(button)
        expect(tooltip()).toBeNull()
    })
})
