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
        layers: {},
    },
}

const DEFAULT_MAP_VIEWS = [
    { id: 'layer1', name: 'Layer 1', layer: THEMATIC_LAYER, data: [{}] },
]

const referenceLayer = (
    rows = [{ dimension: 'ou', items: [{ id: 'country1' }] }]
) => ({
    id: 'ref1',
    layer: 'combinedTableRef',
    rows,
})

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
    {
        id: 'layer1',
        name: 'Layer 1',
        layer: THEMATIC_LAYER,
        data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
    },
    {
        id: 'layer2',
        name: 'Layer 2',
        layer: THEMATIC_LAYER,
        data: [{ properties: { orgUnitPath: '/country1/ou2' } }],
    },
]

const getLayerSelector = () => screen.getByTestId('data-table-layer-selector')

describe('BottomPanel layer selector', () => {
    test('lists every eligible layer, whether or not its table is open, plus a Combined option', () => {
        renderBottomPanel({
            dataTable: DEFAULT_DATA_TABLE_STATE,
            mapViews: twoEligibleLayers,
        })

        // layer1 is the only one open, but layer2 is still listed since it's
        // eligible - the dropdown covers every eligible map layer, not just
        // already-open tabs.
        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
        expect(screen.getByText('Combined')).toBeInTheDocument()
    })

    test('selecting a different, already-open layer switches the active layer shown in the table', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        expect(screen.getByTestId('datatable-mock')).toHaveTextContent('layer2')

        fireEvent.change(getLayerSelector(), { target: { value: 'layer1' } })

        expect(screen.getByTestId('datatable-mock')).toHaveTextContent('layer1')
    })

    test('selecting a layer that has not been opened yet opens it and makes it active', () => {
        const { store } = renderBottomPanel({
            dataTable: DEFAULT_DATA_TABLE_STATE,
            mapViews: twoEligibleLayers,
        })

        fireEvent.change(getLayerSelector(), { target: { value: 'layer2' } })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_TOGGLE', id: 'layer2' },
        ])
    })

    test('does not re-dispatch toggleDataTable when selecting an already-open layer', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        fireEvent.change(getLayerSelector(), { target: { value: 'layer1' } })

        expect(store.getActions()).toEqual([])
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

    test('selecting Combined dispatches DATA_TABLE_COMBINED_VIEW_TOGGLE, and nothing else, once a reference with org units already exists', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: [...twoEligibleLayers, referenceLayer()],
        })

        fireEvent.change(getLayerSelector(), {
            target: { value: '__combined__' },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
        ])
    })

    test('selecting Combined also opens a draft reference layer editor when none exists yet', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: twoEligibleLayers,
        })

        fireEvent.change(getLayerSelector(), {
            target: { value: '__combined__' },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
            {
                type: 'LAYER_EDIT',
                payload: {
                    layer: 'combinedTableRef',
                    isVisible: false,
                    rows: [],
                },
            },
        ])
    })

    test('selecting Combined opens the existing reference layer editor when it has no org units selected yet', () => {
        const emptyReference = referenceLayer([])
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
            },
            mapViews: [...twoEligibleLayers, emptyReference],
        })

        fireEvent.change(getLayerSelector(), {
            target: { value: '__combined__' },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
            { type: 'LAYER_EDIT', payload: emptyReference },
        ])
    })
})

describe('BottomPanel Combined join controls', () => {
    const combinedMapViews = [...twoEligibleLayers, referenceLayer()]

    test('shows the reference org unit control and join layers control, and hides per-layer-only controls, while Combined is active', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: combinedMapViews,
        })

        expect(
            screen.getByLabelText('Configure reference org units')
        ).toBeInTheDocument()
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
            mapViews: combinedMapViews,
        })

        expect(screen.getByLabelText('Configure columns')).toBeInTheDocument()
    })

    test('toggling a layer on in the join-layers popover dispatches DATA_TABLE_JOIN_CONFIG_SET with that layer added', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: combinedMapViews,
        })

        fireEvent.click(screen.getByLabelText('Choose layers to combine'))
        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 1' }))

        expect(store.getActions()).toEqual([
            {
                type: 'DATA_TABLE_JOIN_CONFIG_SET',
                config: {
                    layers: {
                        layer1: {
                            type: 'orgUnit',
                            aggregation: { rawValue: 'SUM' },
                        },
                    },
                },
            },
        ])
    })

    test('toggling an already-joined layer off dispatches DATA_TABLE_JOIN_CONFIG_SET with that layer removed', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
                joinConfig: {
                    layers: {
                        layer1: {
                            type: 'orgUnit',
                            aggregation: { rawValue: 'SUM' },
                        },
                        layer2: {
                            type: 'orgUnit',
                            aggregation: { rawValue: 'SUM' },
                        },
                    },
                },
            },
            mapViews: combinedMapViews,
        })

        fireEvent.click(screen.getByLabelText('Choose layers to combine'))
        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 1' }))

        expect(store.getActions()).toEqual([
            {
                type: 'DATA_TABLE_JOIN_CONFIG_SET',
                config: {
                    layers: {
                        layer2: {
                            type: 'orgUnit',
                            aggregation: { rawValue: 'SUM' },
                        },
                    },
                },
            },
        ])
    })
})

describe('BottomPanel joinConfig hydration from a saved reference layer', () => {
    const persistedJoinConfig = {
        layerA: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
    }

    test("restores a loaded reference layer's persisted combinedJoinConfig once", () => {
        const { store } = renderBottomPanel({
            mapViews: [
                ...DEFAULT_MAP_VIEWS,
                {
                    ...referenceLayer(),
                    isLoaded: true,
                    combinedJoinConfig: persistedJoinConfig,
                },
            ],
        })

        expect(store.getActions()).toContainEqual({
            type: 'DATA_TABLE_JOIN_CONFIG_SET',
            config: { layers: persistedJoinConfig },
        })
    })

    test('does not restore anything when the reference layer has not finished loading yet', () => {
        const { store } = renderBottomPanel({
            mapViews: [
                ...DEFAULT_MAP_VIEWS,
                {
                    ...referenceLayer(),
                    isLoaded: false,
                    combinedJoinConfig: persistedJoinConfig,
                },
            ],
        })

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'DATA_TABLE_JOIN_CONFIG_SET' })
        )
    })

    test('does not restore anything when the reference layer has no persisted combinedJoinConfig', () => {
        const { store } = renderBottomPanel({
            mapViews: [
                ...DEFAULT_MAP_VIEWS,
                { ...referenceLayer(), isLoaded: true },
            ],
        })

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'DATA_TABLE_JOIN_CONFIG_SET' })
        )
    })
})
