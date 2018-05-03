import React from 'react';
import { shallow } from 'enzyme';
import Dialog from 'material-ui/Dialog';
import i18next from 'i18next';
import { AboutDialog } from '../AboutDialog';
import { getStubContext } from '../../../../config/testContext';

describe('AboutDialog', () => {
    jest.spyOn(i18next, 't').mockImplementation(text => text);

    it('renders a MUI Dialog', () => {
        const wrapper = shallow(<AboutDialog
            aboutDialogOpen={true}
            closeAboutDialog={jest.fn()}
        />, { context: getStubContext() });

        expect(wrapper.find(Dialog).length).toBe(1);
    });
});
