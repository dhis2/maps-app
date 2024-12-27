import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import StartEndDate from '../StartEndDate.js'

const mockStore = configureStore()

describe('StartEndDate Component', () => {
    let store
    let props
    let renderWithProps

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
        }
        renderWithProps = (props) =>
            mount(
                <Provider store={store}>
                    <StartEndDate {...props} />
                </Provider>
            )
    })

    it('renders StartEndDate with initial dates', () => {
        const wrapper = renderWithProps(props)
        const startDateInput = wrapper
            .find('div[data-test="start-date-input-content"]')
            .find('input')
        const endDateInput = wrapper
            .find('div[data-test="end-date-input-content"]')
            .find('input')
        expect(startDateInput.prop('value')).toBe('2023-01-01')
        expect(endDateInput.prop('value')).toBe('2023-12-31')
    })
})
