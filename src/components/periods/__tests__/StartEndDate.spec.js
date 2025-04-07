import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import StartEndDate from '../StartEndDate.js'

const mockStore = configureMockStore()

describe('StartEndDate Component', () => {
    let store
    let props
    // let renderWithProps

    beforeEach(() => {
        store = mockStore({
            layerEdit: {
                startDate: '2023-01-01',
                endDate: '2023-12-31',
            },
        })
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
        render(
            <Provider store={store}>
                <StartEndDate {...props} />
            </Provider>
        )
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
