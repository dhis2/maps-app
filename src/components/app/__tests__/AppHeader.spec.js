import React from 'react';
import { shallow } from 'enzyme';
import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
    it('renders a div as the outermost tag', () => {
        const wrapper = shallow(<AppHeader />);
        expect(wrapper.childAt(0).type()).toEqual('div');
    });
});
