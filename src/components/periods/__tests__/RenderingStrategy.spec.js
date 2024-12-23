import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    RENDERING_STRATEGY_SINGLE,
    RENDERING_STRATEGY_TIMELINE,
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
} from '../../../constants/layers.js'
import { countPeriods } from '../../../util/periods.js'
import RenderingStrategy from '../RenderingStrategy.js'

const mockStore = configureMockStore()

const store = mockStore({
    map: {
        mapViews: [{ id: 'layer1', renderingStrategy: 'SINGLE' }],
    },
    layerEdit: {
        filters: [],
    },
})

jest.mock('../../../util/periods', () => ({
    countPeriods: jest.fn(),
}))

describe('RenderingStrategy', () => {
    const renderWithProps = (props) =>
        mount(
            <Provider store={store}>
                <RenderingStrategy {...props} />
            </Provider>
        )

    const layerId = 'layer1'
    const value = RENDERING_STRATEGY_SPLIT_BY_PERIOD
    const periods = []
    const mockOnChange = jest.fn()
    let props

    beforeEach(() => {
        jest.clearAllMocks()
        props = {
            layerId,
            value,
            periods,
            onChange: mockOnChange,
        }
    })

    it('renders all radio buttons with correct labels', () => {
        countPeriods.mockReturnValue(5)
        const wrapper = renderWithProps(props)
        expect(wrapper.find('div.boldLabel.compact').text()).toBe(
            'Period display mode'
        )
        expect(wrapper.find('input').length).toBe(3) // Three radio buttons
        expect(wrapper.find('label').at(0).text()).toBe(
            'Single (combine periods)'
        )
        expect(wrapper.find('label').at(1).text()).toBe('Timeline')
        expect(wrapper.find('label').at(2).text()).toBe('Split map views')
    })

    it('disables timeline and split map views when total periods are below the minimum', () => {
        countPeriods.mockReturnValue(1)
        const wrapper = renderWithProps(props)
        expect(wrapper.find('input').at(1).prop('disabled')).toBeDefined() // Timeline should be disabled
        expect(wrapper.find('input').at(2).prop('disabled')).toBeDefined()
    })

    it('calls onChange with correct value when a radio button is clicked', () => {
        countPeriods.mockReturnValue(5)
        const wrapper = renderWithProps(props)
        wrapper
            .find('input')
            .at(1)
            .simulate('change', {
                target: { value: RENDERING_STRATEGY_TIMELINE },
            })
        expect(mockOnChange).toHaveBeenCalledWith(RENDERING_STRATEGY_TIMELINE)
    })

    it('automatically switches to SINGLE when conditions are not met', () => {
        countPeriods.mockReturnValue(1)
        renderWithProps(props)
        expect(mockOnChange).toHaveBeenCalledWith(RENDERING_STRATEGY_SINGLE)
    })
})
