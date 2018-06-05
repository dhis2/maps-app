import React from 'react';
import { shallow } from 'enzyme';
import Dialog from 'material-ui/Dialog';
import i18n from '@dhis2/d2-i18n';
// import { Button } from '@dhis2/d2-ui-core';
import { AboutDialog } from '../AboutDialog';
import { getStubContext } from '../../../../config/testContext';

jest.spyOn(i18n, 't').mockImplementation(text => text); // stub i18n.t

describe('AboutDialog', () => {
    const renderWithProps = props => shallow(<AboutDialog {...props} />,  { context: getStubContext() });
    let props;

    beforeEach(() => {
        props = {
            aboutDialogOpen: true,
            closeAboutDialog: jest.fn(),
        };
    });

    it('renders a MUI Dialog', () => {
        expect(renderWithProps(props).find(Dialog).length).toBe(1);
    });

    // TODO: Button is not found - wait for MUI v1 upgrade
    // https://github.com/mui-org/material-ui/issues/9200
    /*
    it('call closeAboutDialog function if close button is clicked', () => {
        const closeAboutDialog = jest.fn();
        const wrapper = renderWithProps({...props, closeAboutDialog });
        wrapper.find('Button').simulate('click');
        expect(closeAboutDialog).toHaveBeenCalledTimes(1);
    });
    */
});
