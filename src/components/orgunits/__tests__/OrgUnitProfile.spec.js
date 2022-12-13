import { shallow } from 'enzyme'
import React from 'react'
import Drawer from '../../core/Drawer.js'
import { OrgUnitProfile } from '../OrgUnitProfile.js'

describe('Org unit profile (location details)', () => {
    const renderWithProps = (props) => shallow(<OrgUnitProfile {...props} />)

    it('do not render if no org unit id is passed', () => {
        const wrapper = renderWithProps({ closeOrgUnitProfile: jest.fn() })

        expect(wrapper.type()).toBe(null)
    })

    it('should render a drawer if org unit id is passed', () => {
        const wrapper = renderWithProps({
            id: '123',
            closeOrgUnitProfile: jest.fn(),
        })

        expect(wrapper.type()).toEqual(Drawer)
    })

    it('should call closeOrgUnitProfile when drawer is closed', () => {
        const closeOrgUnitProfile = jest.fn()
        const wrapper = renderWithProps({ id: '123', closeOrgUnitProfile })

        wrapper.find('.close').simulate('click')

        expect(closeOrgUnitProfile).toHaveBeenCalled()
    })
})
