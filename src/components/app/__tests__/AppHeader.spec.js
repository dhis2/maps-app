import React from 'react';
import { shallow } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import AppHeader from '../AppHeader';

// https://github.com/mui-org/material-ui/issues/11864
const AppHeaderNaked = unwrap(AppHeader);

describe('AppHeader', () => {
    it('renders a div as the outermost tag', () => {
        const wrapper = shallow(<AppHeaderNaked classes={{}} />);
        // console.log('shallow', wrapper.debug());
        expect(wrapper.childAt(0).type()).toEqual('div');
    });

    it('renders favorite name if passed in as name prop', () => {
        const name = 'My favorite';
        const wrapper = shallow(<AppHeaderNaked classes={{}} name={name} />);
        expect(wrapper.find('span').text()).toContain(name);
    });
});
