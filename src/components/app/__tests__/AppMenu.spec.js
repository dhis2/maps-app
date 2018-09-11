import React from 'react';
import { shallow } from 'enzyme';
import i18n from '@dhis2/d2-i18n';
import { unwrap } from '@material-ui/core/test-utils';
import Toolbar from '@material-ui/core/Toolbar';
import AppMenu from '../AppMenu';

// https://github.com/mui-org/material-ui/issues/11864
const AppMenuNaked = unwrap(AppMenu);

describe('AppMenu', () => {
    jest.spyOn(i18n, 't').mockImplementation(text => text);

    it('renders a MUI Toolbar', () => {
        const wrapper = shallow(
            <AppMenuNaked classes={{}} openAboutDialog={jest.fn()} />
        );
        expect(wrapper.find(Toolbar).length).toBe(1);
    });
});
