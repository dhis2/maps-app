import React from 'react';
import { shallow } from 'enzyme';
import { LayerToolbar } from '../LayerToolbar';

describe('LayerToolbar', () => {
    const shallowRenderLayerToolbar = props =>
        shallow(
            <LayerToolbar
                opacity={0}
                isVisible={true}
                toggleLayerVisibility={() => null}
                onOpacityChange={() => null}
                {...props}
            />
        );
    it('Should render only a visibility toggle and opacity slider', () => {
        const wrapper = shallowRenderLayerToolbar();
        expect(wrapper.find('[data-test="visibilitybutton"]').length).toBe(1); // Visibility toggle
        expect(wrapper.find('OpacitySlider').length).toBe(1);
        expect(wrapper.find('LayerToolbarMoreMenu').length).toBe(1);
    });

    it('Should show VisibilityIcon when visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: true,
        });

        // https://github.com/mui-org/material-ui/issues/15928#issuecomment-497634585
        expect(wrapper.find('[data-icon="VisibilityIcon"]').length).toBe(1);
        expect(wrapper.find('[data-icon="VisibilityOffIcon"]').length).toBe(0);
    });

    it('Should show VisibilityOffIcon when not visible', () => {
        const wrapper = shallowRenderLayerToolbar({
            isVisible: false,
        });

        // https://github.com/mui-org/material-ui/issues/15928#issuecomment-497634585
        expect(wrapper.find('[data-icon="VisibilityIcon"]').length).toBe(0);
        expect(wrapper.find('[data-icon="VisibilityOffIcon"]').length).toBe(1);
    });

    it('Should call toggleLayerVisibility callback on button press', () => {
        const toggleVisibleFn = jest.fn();
        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
        });
        wrapper.find('[data-test="visibilitybutton"]').simulate('click');
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
        expect(wrapper.find('[data-test="visibilitybutton"]').length).toBe(1);
        expect(wrapper.find('OpacitySlider').length).toBe(1);
        expect(wrapper.find('LayerToolbarMoreMenu').length).toBe(1);
    });

    it('Should match toolbar snapshot WITH Edit button', () => {
        const wrapper = shallowRenderLayerToolbar({
            onEdit: () => null,
        });
        expect(wrapper).toMatchSnapshot();
    });

    it('Should call onEdit callback on button press', () => {
        const toggleVisibleFn = jest.fn();
        const editFn = jest.fn();

        const wrapper = shallowRenderLayerToolbar({
            toggleLayerVisibility: toggleVisibleFn,
            onEdit: editFn,
        });

        wrapper.find('[data-test="editbutton"]').simulate('click');
        expect(editFn).toHaveBeenCalled();
        expect(toggleVisibleFn).not.toHaveBeenCalled();

        wrapper.find('[data-test="visibilitybutton"]').simulate('click');
        expect(toggleVisibleFn).toHaveBeenCalled();
        expect(editFn).toHaveBeenCalledTimes(1);
    });
});
