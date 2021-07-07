import React from 'react';
import { shallow } from 'enzyme';
import { OrgUnitProfile } from '../OrgUnitProfile';

describe('Org unit profile (location details)', () => {
    const renderWithProps = props => shallow(<OrgUnitProfile {...props} />);
    let props;

    beforeEach(() => {
        props = {};
    });

    it('do not render if no org unit id is passed', () => {
        expect(renderWithProps({ closeOrgUnit: jest.fn() }).type()).toBe(null);
    });
});
