import React from 'react';
import { shallow } from 'enzyme';
import Drawer from '../Drawer';

describe('Drawer', () => {
    const renderWithProps = props => shallow(<Drawer {...props} />);

    it('should render a right drawer by default', () => {
        const wrapper = renderWithProps();

        expect(wrapper.hasClass('drawer')).toBeTruthy();
        expect(wrapper.hasClass('right')).toBeTruthy();
        expect(wrapper.hasClass('left')).toBeFalsy();
    });

    it('should render a left drawer if left position', () => {
        const wrapper = renderWithProps({ position: 'left' });

        expect(wrapper.hasClass('left')).toBeTruthy();
        expect(wrapper.hasClass('right')).toBeFalsy();
    });

    it('should include class name if passed', () => {
        const wrapper = renderWithProps({ className: 'myClass' });

        expect(wrapper.hasClass('myClass')).toBeTruthy();
    });

    it('should render children', () => {
        const wrapper = shallow(
            <Drawer>
                <h4>Title</h4>
                <img src="" />
            </Drawer>
        );

        expect(wrapper.find('h4')).toBeTruthy();
        expect(wrapper.find('img')).toBeTruthy();
    });
});
