import React from 'react';
import { shallow } from 'enzyme';
import { unwrap } from '@material-ui/core/test-utils';
import Dialog from '@material-ui/core/Dialog';
import OrgUnitDialog from '../OrgUnitDialog';

// https://github.com/mui-org/material-ui/issues/11864
const OrgUnitDialogNaked = unwrap(OrgUnitDialog);

describe('Org unit dialog (infrastuctural data)', () => {
    const renderWithProps = props =>
        shallow(<OrgUnitDialogNaked classes={{}} {...props} />);
    let props;

    beforeEach(() => {
        props = {
            id: 'abc123',
            parent: {
                name: 'Parent',
            },
            organisationUnitGroups: {
                toArray: () => [],
            },
            closeOrgUnit: jest.fn(),
        };
    });

    it('do not render if no org unit id is passed', () => {
        expect(renderWithProps({ closeOrgUnit: jest.fn() }).type()).toBe(null);
    });

    it('renders a MUI Dialog if an org unit id is passed', () => {
        expect(renderWithProps(props).find(Dialog).length).toBe(1);
    });

    // TODO: Check if loadConfigurations or loadData is called
});
