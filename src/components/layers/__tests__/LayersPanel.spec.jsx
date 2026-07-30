import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {
    COMBINED_TABLE_REF_LAYER,
    THEMATIC_LAYER,
} from '../../../constants/layers.js'
import LayersPanel, { getSortIndices } from '../LayersPanel.jsx'

jest.mock('../overlays/OverlayCard.jsx', () => {
    const PropTypes = jest.requireActual('prop-types')
    const OverlayCardMock = ({ layer }) => (
        <div data-test="overlaycard-mock">{layer.name}</div>
    )
    OverlayCardMock.displayName = 'OverlayCardMock'
    OverlayCardMock.propTypes = { layer: PropTypes.object.isRequired }
    return OverlayCardMock
})

jest.mock('../basemaps/BasemapCard.jsx', () => {
    const BasemapCardMock = () => <div data-test="basemapcard-mock" />
    BasemapCardMock.displayName = 'BasemapCardMock'
    return BasemapCardMock
})

jest.mock('../LayersToggle.jsx', () => {
    const LayersToggleMock = () => <div data-test="layerstoggle-mock" />
    LayersToggleMock.displayName = 'LayersToggleMock'
    return LayersToggleMock
})

const mockStore = configureMockStore()

const renderLayersPanel = (mapViews) => {
    const store = mockStore({
        ui: { layersPanelOpen: true },
        map: { mapViews },
    })
    return render(
        <Provider store={store}>
            <LayersPanel />
        </Provider>
    )
}

describe('LayersPanel — reference org unit layer exclusion', () => {
    test('never renders a card for the Combined data table reference layer', () => {
        renderLayersPanel([
            { id: 'layer1', name: 'Layer 1', layer: THEMATIC_LAYER },
            {
                id: 'ref1',
                name: 'Reference',
                layer: COMBINED_TABLE_REF_LAYER,
            },
            { id: 'layer2', name: 'Layer 2', layer: THEMATIC_LAYER },
        ])

        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
        expect(screen.queryByText('Reference')).not.toBeInTheDocument()
        expect(screen.getAllByTestId('overlaycard-mock')).toHaveLength(2)
    })
})

describe('getSortIndices', () => {
    const reversedMapViews = [
        { id: 'layer2' },
        { id: 'ref1' },
        { id: 'layer1' },
    ]

    test('finds indices in the unfiltered reversed list, not a filtered display list', () => {
        expect(getSortIndices(reversedMapViews, 'layer1', 'layer2')).toEqual({
            oldIndex: 2,
            newIndex: 0,
        })
    })

    test('returns -1 for an id not present in the list', () => {
        expect(getSortIndices(reversedMapViews, 'missing', 'layer2')).toEqual({
            oldIndex: -1,
            newIndex: 0,
        })
    })
})
