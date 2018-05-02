import React from 'react';
import { shallow } from 'enzyme';
import Dialog from 'material-ui/Dialog';
import { OrgUnitDialog } from '../OrgUnitDialog';

describe('Org unit dialog (infrastuctural data)', () => {
    const renderWithProps = props => shallow(<OrgUnitDialog {...props} />);
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

    it('not renders if no org unit id is passed', () => {
        expect(renderWithProps({ closeOrgUnit: jest.fn() }).type()).toBe(null);
    });

    it('renders a MUI Dialog if an org unit id is passed', () => {
        expect(renderWithProps(props).find(Dialog).length).toBe(1);
    });

    // TODO: Check if loadConfigurations or loadData is called
});
