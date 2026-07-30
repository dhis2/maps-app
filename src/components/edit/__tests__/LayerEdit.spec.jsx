import { render, screen } from '@testing-library/react'
import PropTypes from 'prop-types'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LayerEdit from '../LayerEdit.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({ systemSettings: {}, periodsSettings: {} }),
}))

jest.mock('../../OrgUnitsProvider.jsx', () => ({
    useOrgUnits: () => ({}),
}))

function mockDialog(testId) {
    const Mock = ({ hideStyleTab }) => (
        <div data-test={testId}>{String(!!hideStyleTab)}</div>
    )
    Mock.propTypes = {
        hideStyleTab: PropTypes.bool,
    }
    Mock.displayName = testId
    return Mock
}

jest.mock('../orgUnit/OrgUnitDialog.jsx', () =>
    mockDialog('orgunitdialog-mock')
)
jest.mock('../event/EventDialog.jsx', () => mockDialog('eventdialog-mock'))
jest.mock('../trackedEntity/TrackedEntityDialog.jsx', () =>
    mockDialog('trackedentitydialog-mock')
)
jest.mock('../FacilityDialog.jsx', () => mockDialog('facilitydialog-mock'))
jest.mock('../thematic/ThematicDialog.jsx', () =>
    mockDialog('thematicdialog-mock')
)
jest.mock('../earthEngine/EarthEngineDialog.jsx', () =>
    mockDialog('earthenginedialog-mock')
)
jest.mock('../geoJson/GeoJsonDialog.jsx', () =>
    mockDialog('geojsondialog-mock')
)

const mockStore = configureMockStore()

const renderLayerEdit = (layer) => {
    const store = mockStore({ layerEdit: layer })
    return render(
        <Provider store={store}>
            <LayerEdit />
        </Provider>
    )
}

describe('LayerEdit — reference org unit layer', () => {
    test('shows a state-agnostic "Configure reference org units" title, with no id (new)', () => {
        renderLayerEdit({ layer: 'combinedTableRef', rows: [] })
        expect(
            screen.getByText('Configure reference org units')
        ).toBeInTheDocument()
    })

    test('shows the same title once it has an id (already saved/editing)', () => {
        renderLayerEdit({ id: 'ref1', layer: 'combinedTableRef', rows: [] })
        expect(
            screen.getByText('Configure reference org units')
        ).toBeInTheDocument()
    })

    test('passes hideStyleTab=true to OrgUnitDialog for the reference layer type', () => {
        renderLayerEdit({ layer: 'combinedTableRef', rows: [] })
        expect(screen.getByTestId('orgunitdialog-mock')).toHaveTextContent(
            'true'
        )
    })

    test('passes hideStyleTab=false to OrgUnitDialog for a real org unit layer', () => {
        renderLayerEdit({ layer: 'orgUnit', rows: [] })
        expect(screen.getByTestId('orgunitdialog-mock')).toHaveTextContent(
            'false'
        )
        expect(screen.getByText('Add new org unit layer')).toBeInTheDocument()
    })
})
