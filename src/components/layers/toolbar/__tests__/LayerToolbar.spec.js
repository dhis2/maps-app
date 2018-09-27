import React from 'react';
import { shallow } from 'enzyme';
import { LayerToolbar } from '../LayerToolbar';

describe('LayerToolbar', () => {
    const shallowRenderLayerToolbar = props => (
        shallow(
            <LayerToolbar
                classes={{}}
                opacity={0}
                isVisible={true}
                toggleLayerVisibility={() => null}
                onOpacityChange={() => null}
                {...props}
            />
        )
    )
    it('Should render only a visibility toggle and opacity slider', () => {
        const wrapper = shallowRenderLayerToolbar();
        expect(wrapper.find('WithStyles(IconButton)').length).toBe(1); // Visibility toggle
        expect(wrapper.find('WithStyles(OpacitySlider)').length).toBe(1);
        expect(wrapper.find('WithStyles(LayerToolbarMoreMenu)').length).toBe(1);
    });

    it('Should show VisibilityIcon when visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: true,
        });
        expect(wrapper.find('pure(VisibilityIcon)').length).toBe(1);
        expect(wrapper.find('pure(VisibilityOffIcon)').length).toBe(0);
    });

    it('Should show VisibilityOffIcon when not visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: false,
        });
        expect(wrapper.find('pure(VisibilityIcon)').length).toBe(0);
        expect(wrapper.find('pure(VisibilityOffIcon)').length).toBe(1);
    });

    it('Should call toggleLayerVisibility callback on button press', () => {
        const toggleVisibleFn = jest.fn();
        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
        });
        wrapper.find('WithStyles(IconButton)').simulate('click');
        expect(toggleVisibleFn).toHaveBeenCalled();
    });

    it('Should match toolbar snapshot without Edit button', () => {
        const wrapper = shallowRenderLayerToolbar();
        expect(wrapper).toMatchSnapshot();
    });

    it('Should render edit button if passed onEdit prop', () => {
        const wrapper = shallowRenderLayerToolbar({
            onEdit: () => null,
        });
        expect(wrapper.find('WithStyles(IconButton)').length).toBe(2); // Visibility toggle and Edit
        expect(wrapper.find('WithStyles(OpacitySlider)').length).toBe(1);
        expect(wrapper.find('WithStyles(LayerToolbarMoreMenu)').length).toBe(1);
    });

    it('Should match toolbar snapshot WITH Edit button', () => {
        const wrapper = shallowRenderLayerToolbar({
            onEdit: () => null,
        })
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call onEdit callback on button press', () => {
        const toggleVisibleFn = jest.fn();
        const editFn = jest.fn();

        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
            onEdit: editFn,
        });

        // First button should be Edit
        wrapper
            .find('WithStyles(IconButton)')
            .first()
            .simulate('click');
        expect(editFn).toHaveBeenCalled();
        expect(toggleVisibleFn).not.toHaveBeenCalled();

        // Second button should be Visibility Toggle
        wrapper
            .find('WithStyles(IconButton)')
            .at(1)
            .simulate('click');
        expect(toggleVisibleFn).toHaveBeenCalled();
        expect(editFn).toHaveBeenCalledTimes(1);
    });
});