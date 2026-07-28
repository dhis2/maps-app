import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import WindowDimensionsProvider from '../../WindowDimensionsProvider.jsx'
import BottomPanel from '../BottomPanel.jsx'

jest.mock('../DataTable.jsx', () => {
    // eslint-disable-next-line react/prop-types
    const DataTableMock = ({ activeLayerId }) => (
        <div data-test="datatable-mock">{activeLayerId}</div>
    )
    DataTableMock.displayName = 'DataTableMock'
    return DataTableMock
})

const mockStore = configureMockStore()

// jsdom doesn't implement pointer capture or ResizeObserver
beforeAll(() => {
    Element.prototype.setPointerCapture = jest.fn()
    Element.prototype.releasePointerCapture = jest.fn()
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
})

const DATA_TABLE_HEIGHT = 300

const DEFAULT_DATA_TABLE_STATE = {
    openIds: ['layer1'],
    combinedView: false,
    joinConfig: {
        level: 'orgUnit',
        layerIds: [],
        pointLayerId: null,
        polygonLayerId: null,
    },
}

const DEFAULT_MAP_VIEWS = [{ id: 'layer1', name: 'Layer 1' }]

const renderBottomPanel = ({
    dataTable = DEFAULT_DATA_TABLE_STATE,
    mapViews = DEFAULT_MAP_VIEWS,
} = {}) => {
    const store = mockStore({
        ui: {
            dataTableHeight: DATA_TABLE_HEIGHT,
            showOnlyFeaturesInView: false,
            selectionFilter: [],
            highlightColor: null,
        },
        dataTable,
        map: { mapViews },
    })
    const { container } = render(
        <Provider store={store}>
            <WindowDimensionsProvider>
                <BottomPanel />
            </WindowDimensionsProvider>
        </Provider>
    )
    return { handle: container.querySelector('.resizeHandle'), store }
}

const getDisplayHeight = () =>
    document.documentElement.style.getPropertyValue('--data-table-height')

describe('BottomPanel resize cancel', () => {
    test('cancelling a drag that never collapsed the panel reverts the transient height', () => {
        const { handle } = renderBottomPanel()
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 })
        fireEvent.pointerMove(handle, { pointerId: 1, clientY: 600 })
        expect(getDisplayHeight()).not.toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 600 })
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)
    })

    test('cancelling a drag that collapsed the panel restores the pre-drag expanded height', () => {
        const { handle } = renderBottomPanel()
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.pointerDown(handle, { pointerId: 1, clientY: 500 })
        // Drag far enough down to cross the collapse threshold (MIN_HEIGHT)
        fireEvent.pointerMove(handle, {
            pointerId: 1,
            clientY: window.innerHeight,
        })
        expect(getDisplayHeight()).not.toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.pointerCancel(handle, { pointerId: 1, clientY: 0 })
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)
    })
})

const twoEligibleLayers = [
    { id: 'layer1', name: 'Layer 1', layer: THEMATIC_LAYER, data: [{}] },
    { id: 'layer2', name: 'Layer 2', layer: THEMATIC_LAYER, data: [{}] },
]

describe('BottomPanel tabs', () => {
    test('renders no tab bar with a single open layer and no other eligible layers', () => {
        renderBottomPanel()

        expect(screen.queryAllByRole('tab')).toHaveLength(0)
    })

    test('renders a tab per open layer, and a Combined tab, once 2+ eligible layers exist', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        const tabs = screen.getAllByRole('tab')
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'Layer 1',
            'Layer 2',
            'Combined',
        ])
    })

    test('shows the Combined tab once 2+ eligible layers exist even with a single open tab', () => {
        renderBottomPanel({
            dataTable: DEFAULT_DATA_TABLE_STATE,
            mapViews: twoEligibleLayers,
        })

        const tabs = screen.getAllByRole('tab')
        // Only the open layer gets its own tab - the second eligible layer
        // isn't open, so it shouldn't render a tab of its own.
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            'Layer 1',
            'Combined',
        ])
    })

    test('clicking a different tab switches the active layer shown in the table', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        expect(screen.getByTestId('datatable-mock')).toHaveTextContent('layer2')

        fireEvent.click(screen.getByText('Layer 1'))

        expect(screen.getByTestId('datatable-mock')).toHaveTextContent('layer1')
    })

    test('closing a tab dispatches toggleDataTable for that layer without switching the active tab', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        fireEvent.click(screen.getByLabelText('Close Layer 1 tab'))

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_TOGGLE', id: 'layer1' },
        ])
    })

    test('clicking the Combined tab dispatches DATA_TABLE_COMBINED_VIEW_TOGGLE', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        fireEvent.click(screen.getByText('Combined'))

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
        ])
    })
})
