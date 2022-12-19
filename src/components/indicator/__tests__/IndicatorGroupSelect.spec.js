import { render, act } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { loadIndicatorGroups } from '../../../actions/indicators.js'
import IndicatorGroupSelect from '../IndicatorGroupSelect.js'

const mockStore = configureMockStore()

/* eslint-disable react/prop-types */
jest.mock('@dhis2/ui', () => {
    const originalModule = jest.requireActual('@dhis2/ui')

    return {
        __esModule: true,
        ...originalModule,
        SingleSelectField: function Mock(props) {
            return <div className="ui-SingleSelectField">{props.children}</div>
        },
        SingleSelectOption: function Mock({ children }) {
            return <div className="ui-SingleSelectOption">{children}</div>
        },
    }
})
/* eslint-enable react/prop-types */

jest.mock('../../../actions/indicators.js', () => {
    return {
        loadIndicatorGroups: jest
            .fn()
            .mockReturnValue({ type: 'INDICATORS_LOAD' }),
    }
})

describe('IndicatorGroupSelect', () => {
    test('renders SelectField', () => {
        const store = {
            indicatorGroups: [
                { id: 'indicator1', name: 'Indicator 1' },
                { id: 'indicator2', name: 'Indicator 2' },
            ],
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <IndicatorGroupSelect onChange={jest.fn()} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
        expect(loadIndicatorGroups).not.toHaveBeenCalled()
    })

    test('calls loadIndicatorGroups if no indicator groups exist', async () => {
        const promise = Promise.resolve()
        const store = {}

        const { container } = render(
            <Provider store={mockStore(store)}>
                <IndicatorGroupSelect onChange={jest.fn()} />
            </Provider>
        )

        await act(() => promise)
        expect(container).toMatchSnapshot()

        expect(loadIndicatorGroups).toHaveBeenCalled()
    })
})
