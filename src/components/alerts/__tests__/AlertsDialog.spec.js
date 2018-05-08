import React from 'react';
import { shallow } from 'enzyme';
import Dialog from 'material-ui/Dialog';
import i18next from 'i18next';
import { AlertsDialog } from '../AlertsDialog';
import { getStubContext } from '../../../../config/testContext';

jest.spyOn(i18next, 't').mockImplementation(text => text); // stub i18next.t

describe('AlertsDialog', () => {
    const renderWithProps = props => shallow(<AlertsDialog {...props} />,  { context: getStubContext() });
    const alerts = [{
        title: 'Title',
        description: 'Description',
    }];
    let props;

    beforeEach(() => {
        props = {
            clearAlerts: jest.fn(),
        };
    });

    it('should not render MUI Dialog if no alert is passed', () => {
        expect(renderWithProps(props).find(Dialog).length).toBe(0);
    });

    it('renders MUI Dialog if alerts are passed', () => {
        expect(renderWithProps({ ...props, alerts }).find(Dialog).length).toBe(1);
    });

    it('renders passed alert', () => {
        const wrapper = renderWithProps({ ...props, alerts });
        expect(wrapper.find('strong').text()).toContain(alerts[0].title);
        expect(wrapper.find('div').text()).toContain(alerts[0].description);
    });

    // TODO: test button/clearAlerts after MUI v1 upgrade
    // https://github.com/mui-org/material-ui/issues/9200
});
