import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import OptionsFilter from '../filters/OptionsFilter.jsx'

const options = [
    'Bo',
    'Bombali',
    'Bonthe',
    'Kailahun',
    'Kambia',
    'Kenema',
    'Koinadugu',
    'Kono',
    'Moyamba',
].map((value) => ({ value, label: value, count: 1 }))

const renderFilter = (draft) => {
    const onChange = jest.fn()
    render(
        <OptionsFilter options={options} draft={draft} onChange={onChange} />
    )
    return onChange
}

const search = (text) =>
    fireEvent.change(screen.getByPlaceholderText('Search options'), {
        target: { value: text },
    })

describe('OptionsFilter select all toggle', () => {
    test('selects and deselects every option without a search', () => {
        const onChange = renderFilter()
        fireEvent.click(screen.getByText('Select all'))
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'options',
            values: options.map((o) => o.value),
        })
    })

    test('offers Deselect all once everything is selected', () => {
        renderFilter({
            type: 'options',
            values: options.map((o) => o.value),
        })
        expect(screen.getByText('Deselect all')).toBeTruthy()
    })

    test('only selects matching options while searching', () => {
        const onChange = renderFilter({ type: 'options', values: ['Kono'] })
        search('bo')
        fireEvent.click(screen.getByText('Select 3 matching'))
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'options',
            values: ['Kono', 'Bo', 'Bombali', 'Bonthe'],
        })
    })

    test('only deselects matching options while searching', () => {
        const onChange = renderFilter({
            type: 'options',
            values: ['Bo', 'Bombali', 'Bonthe', 'Kono'],
        })
        search('bo')
        fireEvent.click(screen.getByText('Deselect 3 matching'))
        expect(onChange).toHaveBeenLastCalledWith({
            type: 'options',
            values: ['Kono'],
        })
    })

    test('hides the toggle when nothing matches', () => {
        renderFilter()
        search('xyz')
        expect(screen.queryByText(/select/i)).toBeNull()
    })
})
