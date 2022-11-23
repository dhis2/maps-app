import { shallow } from 'enzyme'
import React from 'react'
import { LegendPosition } from '../LegendPosition.js'

describe('LegendPosition', () => {
    const renderComponent = (props) =>
        shallow(
            <LegendPosition
                position="bottomright"
                onChange={() => null}
                {...props}
            />
        )

    it('Should render a legend position component', () => {
        expect(renderComponent().exists()).toBe(true)
    })

    it('Should mark a position as selected', () => {
        const wrapper = renderComponent()

        expect(wrapper.find('.selected').find('.bottomright').exists()).toBe(
            true
        )
        wrapper.setProps({ position: 'topleft' })
        expect(wrapper.find('.selected').find('.topleft').exists()).toBe(true)
    })

    it('should call onChange when legend position is changed', () => {
        const onChangeSpy = jest.fn()
        const wrapper = renderComponent({
            onChange: onChangeSpy,
        })

        wrapper.find('.topright').parent().simulate('click')
        expect(onChangeSpy).toHaveBeenCalledWith('topright')
    })
})
