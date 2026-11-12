import { render, fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import useOptionSet from '../../../../hooks/useOptionSet.js'
import OptionsFilter from '../OptionsFilter.jsx'

jest.mock('../../../../hooks/useOptionSet.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

beforeEach(() => {
    useOptionSet.mockReturnValue({ optionSet: null })
})

const column = (values, props = {}) => ({
    options: values.map((value) => ({ value })),
    counts: new Map(values.map((value, index) => [value, index + 1])),
    formatValue: (value) => value,
    ...props,
})

const renderFilter = (col, draft) => {
    const onChange = jest.fn()
    render(<OptionsFilter column={col} draft={draft} onChange={onChange} />)
    return onChange
}

const listedLabels = () =>
    within(screen.getByTestId('data-table-filter-options-list'))
        .getAllByRole('listitem')
        .map((item) => item.textContent)

describe('OptionsFilter', () => {
    test('lists each value with its row count, a missing value as "No value"', () => {
        renderFilter(column(['High', 'Low', '']))

        expect(listedLabels()).toEqual(['High1', 'Low2', 'No value3'])
    })

    test('picking a value sets an options filter with it', () => {
        const onChange = renderFilter(column(['High', 'Low']), {
            type: 'options',
            values: ['High'],
        })

        fireEvent.click(screen.getByText('Low'))

        expect(onChange).toHaveBeenCalledWith({
            type: 'options',
            values: ['High', 'Low'],
        })
    })

    test('labels the values as the table cells do, and org units by name in name order', () => {
        const names = { 'a/kono': 'Kono', 'a/bo': 'Bo' }
        renderFilter(
            column(['a/kono', 'a/bo'], {
                renderer: 'renderorgunitname',
                formatValue: (value) => names[value],
            })
        )

        expect(listedLabels()).toEqual(['Bo2', 'Kono1'])
    })

    test('shows the option names of an option set column', () => {
        useOptionSet.mockReturnValue({
            optionSet: { options: [{ code: 'M', name: 'Male' }] },
        })

        renderFilter(column(['M'], { optionSetId: 'pC3N9N77UmT' }))

        expect(listedLabels()).toEqual(['Male1'])
        expect(useOptionSet).toHaveBeenCalledWith('pC3N9N77UmT')
    })

    test('a search narrows the list, and select all picks only what it shows', () => {
        const values = ['Bo', 'Bombali', 'Kono', 'Kenema', 'Kailahun']
        const onChange = renderFilter(
            column([...values, 'Moyamba', 'Port Loko', 'Pujehun', 'Tonkolili'])
        )

        fireEvent.change(
            screen
                .getByTestId('data-table-filter-options-search')
                .querySelector('input'),
            { target: { value: 'bo' } }
        )
        expect(listedLabels()).toEqual(['Bo1', 'Bombali2'])

        fireEvent.click(
            screen.getByTestId('data-table-filter-options-toggle-all')
        )
        expect(onChange).toHaveBeenCalledWith({
            type: 'options',
            values: ['Bo', 'Bombali'],
        })
    })
})
