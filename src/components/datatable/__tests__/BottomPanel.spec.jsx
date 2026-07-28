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

    test('the active layer is correct on the very first render, with no transient null in between', () => {
        // Regression guard: activeLayerId used to be seeded via
        // useState(null) and only synced to openIds a render later via
        // useEffect, so a child requiring a non-null layerId (e.g.
        // ColumnPickerControl) would see `null` for one render and log a
        // prop-types warning. It must now be derived synchronously.
        const consoleError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        renderBottomPanel()

        expect(screen.getByTestId('datatable-mock')).toHaveTextContent('layer1')
        const layerIdWarnings = consoleError.mock.calls.filter((args) =>
            args.some(
                (arg) => typeof arg === 'string' && arg.includes('layerId')
            )
        )
        expect(layerIdWarnings).toEqual([])

        consoleError.mockRestore()
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

describe('BottomPanel Combined join controls', () => {
    test('shows the join-level selector and layer picker, and hides per-layer-only controls, while Combined is active', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: twoEligibleLayers,
        })

        expect(screen.getByDisplayValue('Join by org unit')).toBeInTheDocument()
        expect(
            screen.getByLabelText('Choose layers to combine')
        ).toBeInTheDocument()
        expect(
            screen.queryByLabelText('Highlight color')
        ).not.toBeInTheDocument()
    })

    test('still shows the column picker while Combined is active, session-only (not the per-layer one)', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: twoEligibleLayers,
        })

        expect(screen.getByLabelText('Configure columns')).toBeInTheDocument()
    })

    test('offers and renders the spatial join point/polygon selects when point+polygon candidates exist', () => {
        const pointAndPolygonLayers = [
            {
                id: 'points',
                name: 'Points',
                layer: THEMATIC_LAYER,
                data: [{ geometry: { type: 'Point' } }],
            },
            {
                id: 'polygons',
                name: 'Polygons',
                layer: THEMATIC_LAYER,
                data: [{ geometry: { type: 'Polygon' } }],
            },
        ]

        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['points', 'polygons'],
                combinedView: true,
                joinConfig: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            },
            mapViews: pointAndPolygonLayers,
        })

        expect(
            screen.getByText('Spatial - point inside polygon')
        ).toBeInTheDocument()
        expect(screen.getByText('Point layer')).toBeInTheDocument()
        expect(screen.getByText('Polygon layer')).toBeInTheDocument()
    })

    test('choosing a point layer dispatches DATA_TABLE_JOIN_CONFIG_SET with pointLayerId set', () => {
        const pointAndPolygonLayers = [
            {
                id: 'points',
                name: 'Points',
                layer: THEMATIC_LAYER,
                data: [{ geometry: { type: 'Point' } }],
            },
            {
                id: 'polygons',
                name: 'Polygons',
                layer: THEMATIC_LAYER,
                data: [{ geometry: { type: 'Polygon' } }],
            },
        ]

        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['points', 'polygons'],
                combinedView: true,
                joinConfig: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            },
            mapViews: pointAndPolygonLayers,
        })

        fireEvent.change(screen.getByDisplayValue('Point layer'), {
            target: { value: 'points' },
        })

        expect(store.getActions()).toEqual([
            {
                type: 'DATA_TABLE_JOIN_CONFIG_SET',
                config: {
                    level: 'spatial',
                    layerIds: [],
                    pointLayerId: 'points',
                    polygonLayerId: null,
                },
            },
        ])
    })

    test('does not offer the spatial join option when there is no point/polygon pair', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: twoEligibleLayers,
        })

        expect(
            screen.queryByText('Spatial - point inside polygon')
        ).not.toBeInTheDocument()
        // Regression guard: `pointLayers.length && polygonLayers.length` can
        // evaluate to the number 0 rather than a real boolean, and React
        // renders a stray "0" text node for that instead of nothing.
        expect(
            screen.getByDisplayValue('Join by org unit')
        ).not.toHaveTextContent('0')
    })

    test('changing the join level dispatches DATA_TABLE_JOIN_CONFIG_SET', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: twoEligibleLayers,
        })

        fireEvent.change(screen.getByDisplayValue('Join by org unit'), {
            target: { value: 'parentOrgUnit' },
        })

        expect(store.getActions()).toEqual([
            {
                type: 'DATA_TABLE_JOIN_CONFIG_SET',
                config: {
                    level: 'parentOrgUnit',
                    layerIds: [],
                    pointLayerId: null,
                    polygonLayerId: null,
                },
            },
        ])
    })
})
