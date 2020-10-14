import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from '@dhis2/ui';
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

    it('do not render if no org unit id is passed', () => {
        expect(renderWithProps({ closeOrgUnit: jest.fn() }).type()).toBe(null);
    });

    it('renders a MUI Dialog if an org unit id is passed', () => {
        expect(renderWithProps(props).find(Modal).length).toBe(1);
    });
});
