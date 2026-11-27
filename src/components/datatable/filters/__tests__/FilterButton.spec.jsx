import { act, render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    DATA_FILTER_CLEAR,
    DATA_FILTER_SET,
} from '../../../../constants/actionTypes.js'
import { DIGIT_GROUP_SEPARATOR_COMMA } from '../../../../constants/settings.js'
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

// More than 10 values: the filter opens on its condition
const MANY_VALUES_COLUMN = {
    ...COLUMN,
    rows: Array.from({ length: 11 }, (_, i) => ({ id: `e${i}` })),
}

const ID_HEADER = { name: 'Event ID', dataKey: 'id', type: 'string' }

const renderButton = async (
    filter,
    {
        filterType = 'text',
        header = ID_HEADER,
        column = MANY_VALUES_COLUMN,
    } = {}
) => {
    const store = mockStore({})
    render(
        <Provider store={store}>
            <FilterButton
                layerId="layer1"
                header={header}
                filterType={filterType}
                column={column}
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
    }
    const GENDER_HEADER = { name: 'Gender', dataKey: 'gender', type: 'string' }
    const FEW_VALUES = { column: COLUMN }

    const listItems = () => [
        ...screen
            .getByTestId('data-table-filter-values-list')
            .querySelectorAll('li'),
    ]
    const checkbox = (label) =>
        listItems()
            .find((li) => li.textContent.startsWith(label))
            .querySelector('input')

    test('a column with up to 10 values opens on its list, its condition behind a link', async () => {
        await renderButton(undefined, { header: OU_HEADER, ...FEW_VALUES })

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

    test('a column with more than 10 values opens on its condition, its list behind a link', async () => {
        await renderButton()

        expect(
            screen.queryByTestId('data-table-filter-values-list')
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByTestId('data-table-filter-pick-values'))
        expect(
            screen.getByTestId('data-table-filter-values-list')
        ).toBeInTheDocument()
    })

    test('counts the values the list shows out of the column’s values, "No value" not being one', async () => {
        await renderButton(undefined, { header: OU_HEADER, ...FEW_VALUES })
        const count = () =>
            screen.getByTestId('data-table-filter-values-count').textContent

        // Tests load no translations: plurals read singular
        expect(count()).toMatch(/^2 values?$/)
        fireEvent.click(screen.getByTestId('data-table-filter-add-condition'))
        typeText('ken')
        expect(count()).toMatch(/^1 of 2 values?$/)
    })

    test('a long list shows its first 100 values, its counts grouped as the instance groups digits', async () => {
        await renderButton(undefined, {
            column: {
                ...COLUMN,
                rows: Array.from({ length: 1200 }, (_, i) => ({ id: `e${i}` })),
                keyAnalysisDigitGroupSeparator: DIGIT_GROUP_SEPARATOR_COMMA,
            },
        })
        fireEvent.click(screen.getByTestId('data-table-filter-pick-values'))

        expect(
            screen.getByTestId('data-table-filter-values-count')
        ).toHaveTextContent(/^100 of 1,200 values?$/)
        expect(
            screen.getByText('Set a condition to reach the other values.')
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-filter-preview')
        ).toHaveTextContent('1,200 of 1,200 rows')
    })

    test('groups the digits of each value’s row count as the instance does', async () => {
        await renderButton(undefined, {
            header: GENDER_HEADER,
            column: {
                ...COLUMN,
                rows: Array.from({ length: 1200 }, () => ({ gender: 'F' })),
                keyAnalysisDigitGroupSeparator: DIGIT_GROUP_SEPARATOR_COMMA,
            },
        })

        expect(listItems().map((li) => li.textContent)).toContain('F1,200')
    })

    test('lists the values by the names the cells show, with their row count and "No value"', async () => {
        await renderButton(undefined, { header: OU_HEADER, ...FEW_VALUES })

        expect(listItems().map((li) => li.textContent)).toEqual([
            'No value0',
            'Bo2',
            'Kenema1',
        ])
    })

    test('applies the unchecked values, and shows the rows it keeps', async () => {
        const store = await renderButton(undefined, {
            header: OU_HEADER,
            ...FEW_VALUES,
        })

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
        const store = await renderButton(undefined, {
            header: OU_HEADER,
            ...FEW_VALUES,
        })

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

    test('with a condition, "Select all" and "Deselect all" leave "No value" as the condition set it', async () => {
        const store = await renderButton(undefined, {
            header: GENDER_HEADER,
            ...FEW_VALUES,
        })

        fireEvent.click(screen.getByTestId('data-table-filter-add-condition'))
        typeText('fem')
        fireEvent.click(screen.getByText('Deselect all'))
        expect(checkbox('Female')).not.toBeChecked()
        fireEvent.click(screen.getByText('Select all'))
        expect(checkbox('Female')).toBeChecked()
        expect(checkbox('No value')).not.toBeChecked()

        fireEvent.click(applyButton())
        expect(store.getActions()[0].filter.excluded).toEqual([''])
    })

    test('checking "No value" back keeps the rows without a value despite the condition', async () => {
        const store = await renderButton(undefined, {
            header: GENDER_HEADER,
            ...FEW_VALUES,
        })

        fireEvent.click(screen.getByTestId('data-table-filter-add-condition'))
        typeText('fem')
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

    test('picks dates with the app’s date picker, Escape closing the calendar only', async () => {
        await renderButton(undefined, DATE_COLUMN)
        const input = screen
            .getByTestId('data-table-filter-value')
            .querySelector('input')

        expect(input).toHaveAttribute('placeholder', 'yyyy-mm-dd')
        fireEvent.focus(input)
        expect(screen.getByTestId('calendar')).toBeInTheDocument()

        fireEvent.keyDown(input, { key: 'Escape' })
        expect(screen.queryByTestId('calendar')).not.toBeInTheDocument()
        expect(
            screen.getByTestId('data-table-filter-popover')
        ).toBeInTheDocument()
    })

    test('formats typed dates as yyyy-mm-dd, like the layer dialogs', async () => {
        await renderButton(undefined, DATE_COLUMN)
        const input = screen
            .getByTestId('data-table-filter-value')
            .querySelector('input')

        typeInto('data-table-filter-value', '20250115')
        expect(input).toHaveValue('2025-01-15')

        typeInto('data-table-filter-value', '2025-13')
        expect(input).toHaveValue('2025-12')

        typeInto('data-table-filter-value', '2025-12-')
        fireEvent.blur(input)
        expect(input).toHaveValue('2025-12')
    })

    test('applies a date range from the two date inputs', async () => {
        const store = await renderButton(undefined, DATE_COLUMN)

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

    test('a time column takes 24-hour times, completed when leaving the field', async () => {
        const store = await renderButton(undefined, {
            filterType: 'time',
            header: { name: 'Time', dataKey: 'id', type: 'time' },
        })
        const input = screen
            .getByTestId('data-table-filter-value')
            .querySelector('input')

        expect(input).toHaveAttribute('type', 'text')
        expect(input).toHaveAttribute('placeholder', 'hh:mm')

        typeInto('data-table-filter-value', '2575')
        expect(input).toHaveValue('23:59')

        typeInto('data-table-filter-value', '9')
        fireEvent.blur(input)
        expect(input).toHaveValue('09:00')

        typeInto('data-table-filter-value2', '1730')
        fireEvent.click(applyButton())

        expect(store.getActions()[0].filter).toMatchObject({
            type: 'time',
            operator: 'between',
            value: '09:00',
            value2: '17:30',
        })
    })
})

describe('FilterButton on an icon column', () => {
    const ICON_HEADER = {
        name: 'Icon',
        dataKey: 'icon',
        type: 'string',
        renderer: 'rendericon',
    }
    const ICON_COLUMN = {
        ...COLUMN,
        rows: [
            { icon: 'https://dhis2/images/orgunitgroup/05.png' },
            { icon: 'https://dhis2/images/orgunitgroup/14.png' },
            { legend: 'Unclassified', color: '#cccccc', icon: 'unclassified' },
            { name: 'Facility without coordinates' },
        ],
    }

    test('lists the icons by their file name, the unclassified facilities by their class, those without coordinates under "No value"', async () => {
        await renderButton(undefined, {
            header: ICON_HEADER,
            column: ICON_COLUMN,
        })

        const labels = [
            ...screen
                .getByTestId('data-table-filter-values-list')
                .querySelectorAll('li'),
        ].map((li) => li.textContent)
        expect(labels).toEqual(['No value1', '051', '141', 'Unclassified1'])
        expect(
            screen.getByTestId('data-table-filter-add-condition')
        ).toBeInTheDocument()
    })
})

describe('FilterButton popover', () => {
    test('closes on Escape without applying the draft', async () => {
        const store = await renderButton()

        typeText('bo')
        fireEvent.keyDown(window, { key: 'Escape' })

        expect(
            screen.queryByTestId('data-table-filter-popover')
        ).not.toBeInTheDocument()
        expect(store.getActions()).toEqual([])
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
                    header={ID_HEADER}
                    filterType="text"
                    column={COLUMN}
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
