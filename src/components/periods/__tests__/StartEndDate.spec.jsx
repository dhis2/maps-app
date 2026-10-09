import { screen, within } from '@testing-library/react'
import React from 'react'
import { renderWithRedux } from '../../../test-utils.jsx'
import StartEndDate from '../StartEndDate.jsx'

describe('StartEndDate Component', () => {
    let initialState
    let props

    beforeEach(() => {
        initialState = {
            layerEdit: {
                startDate: '2023-01-01',
                endDate: '2023-12-31',
            },
        }
        props = {
            periodsSettings: {
                calendar: 'gregorian',
                locale: 'en',
            },
            onSelectEndDate: jest.fn(),
            onSelectStartDate: jest.fn(),
        }
    })

    it('renders StartEndDate with initial dates', () => {
        renderWithRedux(<StartEndDate {...props} />, { initialState })
        const startDateInput = screen.getByTestId('start-date-input-content')

        const input = within(startDateInput).getByRole('textbox')

        expect(input).toBeInTheDocument()
        expect(input).toHaveValue('2023-01-01')

        const endDateInput = screen.getByTestId('end-date-input-content')
        const endInput = within(endDateInput).getByRole('textbox')
        expect(endInput).toBeInTheDocument()
        expect(endInput).toHaveValue('2023-12-31')
    })
})
