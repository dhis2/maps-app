import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils.js'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { closeOrgUnitProfile } from '../../../actions/orgUnits.js'
import OrgUnitProfile from '../OrgUnitProfile.js'

jest.mock('../../../util/api.js', () => {
    return {
        apiFetch: jest.fn().mockResolvedValue({}),
    }
})

jest.mock('../../../actions/orgUnits', () => {
    return {
        closeOrgUnitProfile: jest
            .fn()
            .mockReturnValue({ type: 'ORGANISATION_UNIT_PROFILE_CLOSE' }),
    }
})

jest.mock(
    '../OrgUnitData',
    () =>
        function MockOrgUnitData() {
            return <div>OrgUnitData</div>
        }
)

jest.mock(
    '../OrgUnitInfo',
    () =>
        function MockOrgUnitInfo() {
            return <div>OrgUnitInfo</div>
        }
)

const mockStore = configureMockStore()

describe('Org unit profile (location details)', () => {
    test('does not render if no org unit profile is set', () => {
        const store = {
            orgUnitProfile: null,
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <OrgUnitProfile />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders if org unit profile is set', async () => {
        const promise = Promise.resolve()
        const store = {
            orgUnitProfile: 'rainbowDash',
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <OrgUnitProfile />
            </Provider>
        )
        await act(() => promise)
        expect(container).toMatchSnapshot()
    })

    // TODO: this is testing implementation details. Instead it should
    // test that the component renders null after the button is clicked
    test('calls closeOrgUnitProfile when X button clicked', async () => {
        const promise = Promise.resolve()
        const store = {
            orgUnitProfile: 'rainbowDash',
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <OrgUnitProfile />
            </Provider>
        )

        await act(() => promise)
        expect(container).toMatchSnapshot()

        fireEvent.click(screen.getByLabelText('Close'))

        expect(closeOrgUnitProfile).toHaveBeenCalled()
    })
})
