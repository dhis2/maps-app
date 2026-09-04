import { render, screen } from '@testing-library/react'
import React from 'react'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../../constants/selection.js'
import SelectionFilterButton from '../SelectionFilterButton.jsx'

describe('SelectionFilterButton', () => {
    it('shows "All" when no option is active', () => {
        render(<SelectionFilterButton value={[]} onChange={jest.fn()} />)
        expect(screen.getByRole('button')).toHaveTextContent('All')
    })

    it('shows the option label when exactly one option is active', () => {
        render(
            <SelectionFilterButton
                value={[SELECTION_FILTER_SELECTED]}
                onChange={jest.fn()}
            />
        )
        expect(screen.getByRole('button')).toHaveTextContent('Selected')
    })

    it('shows "All" when both options are active, since that shows everything too', () => {
        render(
            <SelectionFilterButton
                value={[
                    SELECTION_FILTER_SELECTED,
                    SELECTION_FILTER_NOT_SELECTED,
                ]}
                onChange={jest.fn()}
            />
        )
        expect(screen.getByRole('button')).toHaveTextContent('All')
    })
})
