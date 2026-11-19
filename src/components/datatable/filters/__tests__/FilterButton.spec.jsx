import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_CLEAR,
    DATA_FILTER_SET,
} from '../../../../constants/actionTypes.js'
import FilterButton from '../FilterButton.jsx'

jest.mock('../../../../hooks/useOptionSet.js', () => () => ({
    optionSet: null,
}))

const mockStore = configureMockStore()

const ROWS = [
    { id: 'a1', ou: 'ou1', gender: 'Female' },
    { id: 'b2', ou: 'ou2', gender: 'Male' },
    { id: 'c3', ou: 'ou1', gender: null },
]

const COLUMN = {
    rows: ROWS,
    filters: {},
    orgUnitIdToName: new Map([
        ['ou1', 'Bo'],
        ['ou2', 'Kenema'],
    ]),
}

const ID_HEADER = { name: 'Event ID', dataKey: 'id', type: 'string' }

const renderButton = async (
    filter,
    { filterType = 'text', header = ID_HEADER } = {}
) => {
    const store = mockStore({})
    render(
        <Provider store={store}>
            <FilterButton
                layerId="layer1"
                header={header}
                filterType={filterType}
                column={COLUMN}
                filter={filter}
            />
        </Provider>
    )
    fireEvent.click(
        screen.getByTestId(`data-table-filter-button-${header.dataKey}`)
    )
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
    const NUMBER_COLUMN = {
        filterType: 'number',
        header: { name: 'Event ID', dataKey: 'id', type: 'number' },
    }
    const range = (value, value2) => ({
        type: 'number',
        operator: 'between',
        value,
        value2,
        excluded: [''],
    })

    test('applies the two typed numbers as a "Between" condition', async () => {
        const store = await renderButton(undefined, NUMBER_COLUMN)

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
        await renderButton(range('1', '5'), NUMBER_COLUMN)

        typeInto('data-table-filter-value2', '')

        expect(applyButton()).toBeDisabled()
        expect(screen.getByText('Fill in both values')).toBeInTheDocument()
    })

    test('numbers in reverse order show why they cannot be applied', async () => {
        await renderButton(range('1', '5'), NUMBER_COLUMN)

        typeInto('data-table-filter-value2', '0')

        expect(applyButton()).toBeDisabled()
        expect(
            screen.getByText('The second number must be greater than the first')
        ).toBeInTheDocument()
    })
})

describe('FilterButton value list', () => {
    const OU_HEADER = {
        name: 'Org unit',
        dataKey: 'ou',
        type: 'string',
        renderer: 'renderorgunitname',
        filterView: 'values',
    }
    const GENDER_HEADER = { name: 'Gender', dataKey: 'gender', type: 'string' }

    const listItems = () => [
        ...screen
            .getByTestId('data-table-filter-values-list')
            .querySelectorAll('li'),
    ]
    const checkbox = (label) =>
        listItems()
            .find((li) => li.textContent.startsWith(label))
            .querySelector('input')

    test('a column with few values opens on its list, its condition behind a link', async () => {
        await renderButton(undefined, { header: OU_HEADER })

        expect(
            screen.getByTestId('data-table-filter-values-list')
        ).toBeInTheDocument()
        expect(
            screen.queryByTestId('data-table-filter-value')
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByTestId('data-table-filter-add-condition'))
        expect(
            screen.getByTestId('data-table-filter-value')
        ).toBeInTheDocument()
    })

    test('other columns open on their condition, the list behind a link', async () => {
        await renderButton(undefined, { header: GENDER_HEADER })

        expect(
            screen.queryByTestId('data-table-filter-values-list')
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByTestId('data-table-filter-pick-values'))
        expect(
            screen.getByTestId('data-table-filter-values-list')
        ).toBeInTheDocument()
    })

    test('lists the values by the names the cells show, with their row count and "No value"', async () => {
        await renderButton(undefined, { header: OU_HEADER })

        expect(listItems().map((li) => li.textContent)).toEqual([
            'No value0',
            'Bo2',
            'Kenema1',
        ])
    })

    test('applies the unchecked values, and shows the rows it keeps', async () => {
        const store = await renderButton(undefined, { header: OU_HEADER })

        fireEvent.click(checkbox('Kenema'))
        expect(
            screen.getByTestId('data-table-filter-preview')
        ).toHaveTextContent('2 of 3 rows')
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter).toEqual({
            type: 'text',
            excluded: ['ou2'],
        })
    })

    test('a condition on a column showing names is applied through the values it leaves out', async () => {
        const store = await renderButton(undefined, { header: OU_HEADER })

        fireEvent.click(screen.getByTestId('data-table-filter-add-condition'))
        typeText('ken')
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter).toEqual({
            type: 'text',
            operator: 'contains',
            value: 'ken',
            excluded: [''],
            excludedByCondition: ['ou1'],
        })
    })

    test('checking "No value" back keeps the rows without a value despite the condition', async () => {
        const store = await renderButton(undefined, { header: GENDER_HEADER })

        typeText('fem')
        fireEvent.click(screen.getByTestId('data-table-filter-pick-values'))
        fireEvent.click(checkbox('No value'))
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter.excluded).toEqual([])
    })
})

describe('FilterButton on date and time columns', () => {
    const DATE_COLUMN = {
        filterType: 'date',
        header: { name: 'Event date', dataKey: 'id', type: 'date' },
    }

    test('applies a date range from the two date inputs', async () => {
        const store = await renderButton(undefined, DATE_COLUMN)

        expect(
            screen.getByTestId('data-table-filter-value').querySelector('input')
        ).toHaveAttribute('type', 'date')
        typeInto('data-table-filter-value', '2025-01-01')
        typeInto('data-table-filter-value2', '2025-03-31')
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter).toEqual({
            type: 'date',
            operator: 'between',
            value: '2025-01-01',
            value2: '2025-03-31',
            excluded: [''],
        })
    })

    test('dates in reverse order show why they cannot be applied', async () => {
        await renderButton(undefined, DATE_COLUMN)

        typeInto('data-table-filter-value', '2025-03-31')
        typeInto('data-table-filter-value2', '2025-01-01')

        expect(applyButton()).toBeDisabled()
        expect(
            screen.getByText('The end date must be after the start date')
        ).toBeInTheDocument()
    })

    test('a time column takes times', async () => {
        await renderButton(undefined, {
            filterType: 'time',
            header: { name: 'Time', dataKey: 'id', type: 'time' },
        })

        expect(
            screen.getByTestId('data-table-filter-value').querySelector('input')
        ).toHaveAttribute('type', 'time')
    })
})
