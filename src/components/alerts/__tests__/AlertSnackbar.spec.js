import React from 'react';
import { shallow } from 'enzyme';
import { Snackbar } from '@material-ui/core';
import i18n from '@dhis2/d2-i18n';
import { AlertSnackbar } from '../AlertSnackbar';
import { getStubContext } from '../../../../config/testContext';

jest.spyOn(i18n, 't').mockImplementation(text => text); // stub i18n.t

describe('AlertSnackbar', () => {
    const renderWithProps = props =>
        shallow(<AlertSnackbar {...props} />, { context: getStubContext() });

    const alert = {
        title: 'Title',
        description: 'Description',
    };
    let props;

    beforeEach(() => {
        props = {
            clearAlerts: jest.fn(),
        };
    });

    it('should not render MUI Snackbar if no alert is passed', () => {
        expect(renderWithProps(props).find(Snackbar).length).toBe(0);
    });

    it('renders MUI Snackbar if alerts are passed', () => {
        expect(renderWithProps({ ...props, alert }).find(Snackbar).length).toBe(
            1
        );
    });

    // TODO: test button/clearAlerts after MUI v1 upgrade
    // https://github.com/mui-org/material-ui/issues/9200
});
