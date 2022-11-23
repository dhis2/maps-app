import React from 'react'
import { shallow } from 'enzyme'
import i18n from '@dhis2/d2-i18n'
import { AlertBar } from '@dhis2/ui'
import { AlertStack } from '../AlertStack'
import { getStubContext } from '../../../../config/testContext'

jest.spyOn(i18n, 't').mockImplementation((text) => text) // stub i18n.t

describe('AlertSnackbar', () => {
    const renderWithProps = (props) =>
        shallow(<AlertStack {...props} />, { context: getStubContext() })

    const alerts = [
        {
            message: 'Message',
        },
    ]
    let props

    beforeEach(() => {
        props = {
            clearAlerts: jest.fn(),
        }
    })

    it('should not render UI AlertBar if no alert is passed', () => {
        expect(renderWithProps(props).find(AlertBar).length).toBe(0)
    })

    it('renders UI AlertBar if alerts are passed', () => {
        expect(
            renderWithProps({ ...props, alerts }).find(AlertBar).length
        ).toBe(1)
    })
})
