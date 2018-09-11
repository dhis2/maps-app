import React from 'react';
import { shallow } from 'enzyme';
import i18n from '@dhis2/d2-i18n';
import Toolbar from '@material-ui/core/Toolbar';
import { AppMenu } from '../AppMenu';

describe('AppMenu', () => {
    jest.spyOn(i18n, 't').mockImplementation(text => text);

    it('renders a MUI Toolbar', () => {
        const wrapper = shallow(<AppMenu openAboutDialog={jest.fn()} />);
        expect(wrapper.find(Toolbar).length).toBe(1);
    });
});
