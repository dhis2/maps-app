import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import FilterInput from '../FilterInput.jsx'

jest.mock('../../../hooks/useOptionSet.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

// eslint-disable-next-line import/first
import useOptionSet from '../../../hooks/useOptionSet.js'

const mockStore = configureMockStore()

const renderFilterInput = (props, dataFilters) => {
    const store = mockStore({
        dataTable: 'layer1',
        map: {
            mapViews: [{ id: 'layer1', dataFilters: dataFilters || {} }],
        },
    })
    return render(
        <Provider store={store}>
            <FilterInput dataKey="name" name="Name" type="string" {...props} />
        </Provider>
    )
}

describe('FilterInput text/numeric path', () => {
    test('renders a free-text input when no options are provided', () => {
        renderFilterInput({})
        expect(
            screen
                .getByTestId('data-table-column-filter-input-Name')
                .querySelector('input')
        ).toBeInTheDocument()
    })

    test('shows the current filter value', () => {
        renderFilterInput({}, { name: 'hospital' })
        expect(
            screen
                .getByTestId('data-table-column-filter-input-Name')
                .querySelector('input')
        ).toHaveValue('hospital')
    })
})

describe('FilterInput multi-select path (no optionSetId)', () => {
    const options = [{ value: 'High' }, { value: 'Low' }]

    test('shows "All" when nothing is selected', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        expect(screen.getByText('All')).toBeInTheDocument()
    })

    test('shows the selected count when a filter is active', () => {
        renderFilterInput(
            { dataKey: 'legend', name: 'Legend', options },
            { legend: ['High'] }
        )
        expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    test('opens a popover with a checkbox per option, using the raw value as the label', () => {
        renderFilterInput({ dataKey: 'legend', name: 'Legend', options })
        fireEvent.click(screen.getByText('All'))
        expect(screen.getByLabelText('High')).toBeInTheDocument()
        expect(screen.getByLabelText('Low')).toBeInTheDocument()
    })
})

describe('FilterInput multi-select path (optionSetId)', () => {
    const options = [{ value: 'CONFIRMED' }, { value: 'PROBABLE' }]

    beforeEach(() => {
        useOptionSet.mockReturnValue({
            optionSet: {
                options: [
                    { code: 'CONFIRMED', name: 'Confirmed case' },
                    { code: 'PROBABLE', name: 'Probable case' },
                ],
            },
        })
    })

    test('resolves stored codes to display names in the popover', () => {
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        fireEvent.click(screen.getByText('All'))
        expect(screen.getByLabelText('Confirmed case')).toBeInTheDocument()
        expect(screen.getByLabelText('Probable case')).toBeInTheDocument()
    })

    test('falls back to the raw code when the option set has not loaded yet', () => {
        useOptionSet.mockReturnValue({ optionSet: null })
        renderFilterInput({
            dataKey: 'caseType',
            name: 'Case classification',
            options,
            optionSetId: 'optionSet1',
        })
        fireEvent.click(screen.getByText('All'))
        expect(screen.getByLabelText('CONFIRMED')).toBeInTheDocument()
    })
})
