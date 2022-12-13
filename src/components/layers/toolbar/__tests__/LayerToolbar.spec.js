import { shallow } from 'enzyme'
import React from 'react'
import { LayerToolbar } from '../LayerToolbar.js'

describe('LayerToolbar', () => {
    const shallowRenderLayerToolbar = (props) =>
        shallow(
            <LayerToolbar
                opacity={0}
                isVisible={true}
                toggleLayerVisibility={() => null}
                onOpacityChange={() => null}
                {...props}
            />
        )
    it('Should render only a visibility toggle and opacity slider', () => {
        const wrapper = shallowRenderLayerToolbar()
        expect(wrapper.find('[dataTest="visibilitybutton"]').length).toBe(1) // Visibility toggle
        expect(wrapper.find('OpacitySlider').length).toBe(1)
    })

    it('Should show SvgView24 when visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: true,
        })

        expect(wrapper.find('SvgView24').length).toBe(1)
        expect(wrapper.find('SvgViewOff24').length).toBe(0)
    })

    it('Should show SvgViewOff24 when not visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: false,
        })

        expect(wrapper.find('SvgView24').length).toBe(0)
        expect(wrapper.find('SvgViewOff24').length).toBe(1)
    })

    it('Should call toggleLayerVisibility callback on button press', () => {
        const toggleVisibleFn = jest.fn()
        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
        })
        wrapper.find('[dataTest="visibilitybutton"]').simulate('click')
        expect(toggleVisibleFn).toHaveBeenCalled()
    })

    it('Should match toolbar snapshot without Edit button', () => {
        const wrapper = shallowRenderLayerToolbar()
        expect(wrapper).toMatchSnapshot()
    })

    it('Should render edit button if passed onEdit prop', () => {
        const wrapper = shallowRenderLayerToolbar({
            onEdit: () => null,
        })
        expect(wrapper.find('[dataTest="visibilitybutton"]').length).toBe(1)
        expect(wrapper.find('OpacitySlider').length).toBe(1)
    })

    it('Should match toolbar snapshot WITH Edit button', () => {
        const wrapper = shallowRenderLayerToolbar({
            onEdit: () => null,
        })
        expect(wrapper).toMatchSnapshot()
    })

    it('Should call onEdit callback on button press', () => {
        const toggleVisibleFn = jest.fn()
        const editFn = jest.fn()

        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
            onEdit: editFn,
        })

        wrapper.find('[dataTest="editbutton"]').simulate('click')
        expect(editFn).toHaveBeenCalled()
        expect(toggleVisibleFn).not.toHaveBeenCalled()

        wrapper.find('[dataTest="visibilitybutton"]').simulate('click')
        expect(toggleVisibleFn).toHaveBeenCalled()
        expect(editFn).toHaveBeenCalledTimes(1)
    })
})
