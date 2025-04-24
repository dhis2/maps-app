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

jest.mock(
    '../../feature/FeatureProfile.js',
    () =>
        function MockFeatureProfile() {
            return <div>Feature Profile</div>
        }
)

const interpretation = { id: 'myinterpretation' }
const orgUnitProfile = 'myorgunit'
const featureProfile = 'myfeature'
const uiWithPanelOpen = { rightPanelOpen: true }
const uiWithPanelClosed = { rightPanelOpen: false }

const testCases = [
    {
        store: {
            interpretation,
            orgUnitProfile,
            featureProfile,
            ui: uiWithPanelOpen,
        },
        expected: 'Interpretations',
    },
    {
        store: {
            interpretation,
            orgUnitProfile,
            featureProfile,
            ui: uiWithPanelClosed,
        },
        expected: 'Interpretations',
    },
    {
        store: {
            interpretation,
            orgUnitProfile: null,
            featureProfile: null,
            ui: uiWithPanelOpen,
        },
        expected: 'Interpretations',
    },
    {
        store: {
            interpretation,
            orgUnitProfile: null,
            featureProfile: null,
            ui: uiWithPanelClosed,
        },
        expected: 'Interpretations',
    },
    {
        store: {
            interpretation: {},
            orgUnitProfile: null,
            featureProfile: null,
            ui: uiWithPanelOpen,
        },
        expected: 'Interpretations',
    },
    {
        store: {
            interpretation: {},
            orgUnitProfile,
            featureProfile,
            ui: uiWithPanelOpen,
        },
        expected: 'OrgUnitProfile',
    },
    {
        store: {
            interpretation: {},
            orgUnitProfile: null,
            featureProfile,
            ui: uiWithPanelOpen,
        },
        expected: 'FeatureProfile',
    },
    {
        store: {
            interpretation: {},
            orgUnitProfile,
            featureProfile: null,
            ui: uiWithPanelClosed,
        },
        expected: 'null',
    },
    {
        store: {
            interpretation: {},
            orgUnitProfile: null,
            featureProfile: null,
            ui: uiWithPanelClosed,
        },
        expected: 'null',
    },
]

describe('DetailsPanel', () => {
    testCases.forEach(({ store, expected }) => {
        test(`renders ${expected} when interpretation=${store.interpretation.id}, orgUnitProfile=${store.orgUnitProfile}, featureProfile=${store.featureProfile} and panelOpen=${store.ui.rightPanelOpen}`, () => {
            const { container } = render(
                <Provider store={mockStore(store)}>
                    <DetailsPanel interpretationsRenderCount={1} />
                </Provider>
            )
            expect(container).toMatchSnapshot()
        })
    })
})
