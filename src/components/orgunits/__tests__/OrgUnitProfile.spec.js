import React from 'react';
import { shallow } from 'enzyme';
import { OrgUnitProfile } from '../OrgUnitProfile';
import Drawer from '../../core/Drawer';

describe('Org unit profile (location details)', () => {
    const renderWithProps = props => shallow(<OrgUnitProfile {...props} />);

    it('do not render if no org unit id is passed', () => {
        const wrapper = renderWithProps({ closeOrgUnit: jest.fn() });

        expect(wrapper.type()).toBe(null);
    });

    it('should render a drawer if org unit id is passed', () => {
        const wrapper = renderWithProps({ id: '123', closeOrgUnit: jest.fn() });

        expect(wrapper.type()).toEqual(Drawer);
    });

    it('should call closeOrgUnit when drawer is closed', () => {
        const closeOrgUnit = jest.fn();
        const wrapper = renderWithProps({ id: '123', closeOrgUnit });

        wrapper.find('.close').simulate('click');

        expect(closeOrgUnit).toHaveBeenCalled();
    });
});
