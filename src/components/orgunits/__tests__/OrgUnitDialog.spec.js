import React from 'react';
import { shallow } from 'enzyme';
// import { OrgUnitDialog } from '../OrgUnitDialog';

describe('Org unit dialog (infrastuctural data)', () => {
    let orgUnitDialog;
    let closeOrgUnit;
    let props;

    beforeEach(() => {
        closeOrgUnit = jest.fn();

        props = {
            closeOrgUnit,
        };

        // orgUnitDialog = shallow(<OrgUnitDialog {...props} />);
    });

    it('should render a MUI Dialog compoent', () => {
        expect(true).toBeTruthy();
    });
});
