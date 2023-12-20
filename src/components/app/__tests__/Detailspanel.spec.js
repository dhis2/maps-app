import { render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import DetailsPanel from '../DetailsPanel.js'

const mockStore = configureMockStore()

jest.mock(
    '../../interpretations/Interpretations.js',
    () =>
        function MockInterpretations() {
            return <div>Interpretations</div>
        }
)

jest.mock(
    '../../orgunits/OrgUnitProfile.js',
    () =>
        function MockOrgUnitProfile() {
            return <div>Org Unit Profile</div>
        }
)

describe('DetailsPanel', () => {
    test('renders InterpretationsPanel when has interpretationId, has orgUnitProfile and panel is open', () => {
        const store = {
            interpretation: { id: 'abc123' },
            orgUnitProfile: 'xyzpdq',
            ui: { rightPanelOpen: true },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
    test('renders InterpretationsPanel when has interpretationId, has orgUnitProfile and panel is closed', () => {
        const store = {
            interpretation: { id: 'abc123' },
            orgUnitProfile: 'xyzpdq',
            ui: { rightPanelOpen: false },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
    test('renders InterpretationsPanel when has interpretationId, no orgUnitProfile and panel is open', () => {
        const store = {
            interpretation: { id: 'abc123' },
            orgUnitProfile: null,
            ui: { rightPanelOpen: true },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders InterpretationsPanel when has interpretationId, no orgUnitProfile and panel is closed', () => {
        const store = {
            interpretation: { id: 'abc123' },
            orgUnitProfile: null,
            ui: { rightPanelOpen: false },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders OrgUnitProfile when no interpretationId, has orgUnitProfile and panel is open', () => {
        const store = {
            interpretation: {},
            orgUnitProfile: 'xyzpdq',
            ui: { rightPanelOpen: true },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders null when no interpretationId, has orgUnitProfile, and panel closed', () => {
        const store = {
            interpretation: {},
            orgUnitProfile: 'xyzpdq',
            ui: { rightPanelOpen: false },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
    test('renders InterpretationsPanel when no interpretationId, no orgUnitProfile and panel open', () => {
        const store = {
            interpretation: {},
            orgUnitProfile: null,
            ui: { rightPanelOpen: true },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    test('renders null when no interpretationId, no orgUnitProfile, and panel closed', () => {
        const store = {
            interpretation: {},
            orgUnitProfile: null,
            ui: { rightPanelOpen: false },
        }

        const { container } = render(
            <Provider store={mockStore(store)}>
                <DetailsPanel interpretationsRenderCount={1} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
