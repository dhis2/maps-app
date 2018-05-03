import React from 'react';
import { shallow } from 'enzyme';
import { AppMenu } from '../AppMenu';
import { Toolbar } from 'material-ui/Toolbar';
import Button from 'material-ui/FlatButton';

describe('AppMenu', () => {
    // TODO: Warning: {i18next.t('About')} returns empty string
    it('renders a MUI Toolbar', () => {
        const wrapper = shallow(<AppMenu openAboutDialog={jest.fn()} />);
        expect(wrapper.find(Toolbar).length).toBe(1);
    });

    it('call openAboutDialog function if About button is clicked', () => {
        const openAboutDialog = jest.fn();
        const wrapper = shallow(<AppMenu openAboutDialog={openAboutDialog} />);
        wrapper.find(Button).simulate('click');
        expect(openAboutDialog).toHaveBeenCalledTimes(1);
    });
});