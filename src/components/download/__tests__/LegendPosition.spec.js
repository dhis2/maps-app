import React from 'react';
import { shallow } from 'enzyme';
import { LegendPosition } from '../LegendPosition';

describe('LegendPosition', () => {
    const classes = {
        topleft: 'topleft-class',
        topright: 'topright-class',
        bottomright: 'bottomright-class',
        selected: 'selected-class',
    };

    const renderComponent = props =>
        shallow(
            <LegendPosition
                classes={classes}
                position="bottomright"
                onChange={() => null}
                {...props}
            />
        );

    it('Should render a legend position component', () => {
        expect(renderComponent().exists()).toBe(true);
    });

    it('Should mark a position as selected', () => {
        const wrapper = renderComponent();
        expect(
            wrapper
                .find('.selected-class')
                .find('.bottomright-class')
                .exists()
        ).toBe(true);
        wrapper.setProps({ position: 'topleft' });
        expect(
            wrapper
                .find('.selected-class')
                .find('.topleft-class')
                .exists()
        ).toBe(true);
    });

    it('should call onChange when legend position is changed', () => {
        const onChangeSpy = jest.fn();
        const wrapper = renderComponent({
            onChange: onChangeSpy,
        });

        wrapper
            .find('.topright-class')
            .parent()
            .simulate('click');
        expect(onChangeSpy).toHaveBeenCalledWith('topright');
    });
});
