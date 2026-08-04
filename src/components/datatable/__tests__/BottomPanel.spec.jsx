import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { SENTINEL_COMBINED_VALUE } from '../../../constants/dataTable.js'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import WindowDimensionsProvider from '../../WindowDimensionsProvider.jsx'
import BottomPanel from '../BottomPanel.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'COMMA' },
    }),
}))

jest.mock('../DataTable.jsx', () => {
    // eslint-disable-next-line react/prop-types
    const DataTableMock = ({ activeLayerId }) => (
        <div data-test="datatable-mock">{activeLayerId}</div>
    )
    DataTableMock.displayName = 'DataTableMock'
    return DataTableMock
})

const mockJoinConfigCalls = []
jest.mock('../CombinedDataTable.jsx', () => {
    // eslint-disable-next-line react/prop-types
    const CombinedDataTableMock = ({ joinConfig }) => {
        mockJoinConfigCalls.push(joinConfig)
        return <div data-test="combined-datatable-mock" />
    }
    CombinedDataTableMock.displayName = 'CombinedDataTableMock'
    return CombinedDataTableMock
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
}

const DEFAULT_MAP_VIEWS = [
    {
        id: 'layer1',
        name: 'Layer 1',
        layer: THEMATIC_LAYER,
        isLoaded: true,
        data: [{}],
    },
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
    ui = {},
} = {}) => {
    const store = mockStore({
        ui: {
            dataTableHeight: DATA_TABLE_HEIGHT,
            showOnlyFeaturesInView: false,
            selectionFilter: [],
            highlightColor: null,
            ...ui,
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
    return {
        handle: container.querySelector('.resizeHandle'),
        container,
        store,
    }
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

describe('BottomPanel double-click to collapse', () => {
    test('double-clicking empty toolbar space toggles the collapsed state', () => {
        const { container } = renderBottomPanel()
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.doubleClick(container.querySelector('.dataTableControls'))

        expect(getDisplayHeight()).not.toBe(`${DATA_TABLE_HEIGHT}px`)
    })

    test('double-clicking the layer selector does not toggle the collapsed state', () => {
        renderBottomPanel()
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.doubleClick(getLayerSelector())

        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)
    })

    test('double-clicking inside an open popover (e.g. Join layers) does not toggle the collapsed state, even on non-control content like the popover background', () => {
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: [...twoEligibleLayers, referenceLayer()],
        })
        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)

        fireEvent.click(screen.getByLabelText('Choose layers to combine'))
        // Rendered via a portal, outside renderBottomPanel()'s own container
        const popover = document.querySelector('.joinLayersPopover')
        expect(popover).toBeInTheDocument()

        fireEvent.doubleClick(popover)

        expect(getDisplayHeight()).toBe(`${DATA_TABLE_HEIGHT}px`)
    })
})

const twoEligibleLayers = [
    {
        id: 'layer1',
        name: 'Layer 1',
        combinedLayerKey: 'layer1',
        layer: THEMATIC_LAYER,
        isLoaded: true,
        data: [{ properties: { orgUnitPath: '/country1/ou1' } }],
    },
    {
        id: 'layer2',
        name: 'Layer 2',
        combinedLayerKey: 'layer2',
        layer: THEMATIC_LAYER,
        isLoaded: true,
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

        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
        expect(screen.getByText('Combined')).toBeInTheDocument()
    })

    test('keeps an already-open tab listed even if its config is edited into a state where isLoaded gets stuck false', () => {
        const stuckLayer = {
            id: 'layer1',
            name: 'Layer 1',
            layer: THEMATIC_LAYER,
            isLoaded: false,
            data: [],
        }
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1'],
            },
            mapViews: [stuckLayer, twoEligibleLayers[1]],
        })

        expect(screen.getByText('Layer 1')).toBeInTheDocument()
        expect(screen.getByText('Layer 2')).toBeInTheDocument()
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
            target: { value: SENTINEL_COMBINED_VALUE },
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
            target: { value: SENTINEL_COMBINED_VALUE },
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
            target: { value: SENTINEL_COMBINED_VALUE },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_COMBINED_VIEW_TOGGLE' },
            { type: 'LAYER_EDIT', payload: emptyReference },
        ])
    })
})

describe('BottomPanel Combined join controls', () => {
    const combinedMapViews = [...twoEligibleLayers, referenceLayer()]

    test('shows the reference org unit control and join layers control while Combined is active', () => {
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
    })

    test('still shows the highlight color and show-in-view controls while Combined is active - they are not per-layer-only', () => {
        const { container } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: combinedMapViews,
        })

        expect(
            container.querySelector('input[type="color"]')
        ).toBeInTheDocument()
        expect(
            screen.getByLabelText('Show only features in current map view')
        ).toBeInTheDocument()
    })

    test('the Clear filters button is enabled in Combined mode when "show only features in view" is active, and clicking it turns that off too', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: combinedMapViews,
            ui: { showOnlyFeaturesInView: true },
        })

        expect(screen.getByLabelText('Clear filters')).not.toBeDisabled()

        fireEvent.click(screen.getByLabelText('Clear filters'))

        expect(store.getActions()).toContainEqual({
            type: 'TOGGLE_SHOW_ONLY_IN_VIEW',
        })
    })

    test('the Clear filters button is enabled in Combined mode when a selection filter is active, and clicking it clears that too', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: combinedMapViews,
            ui: { selectionFilter: ['selected'] },
        })

        expect(screen.getByLabelText('Clear filters')).not.toBeDisabled()

        fireEvent.click(screen.getByLabelText('Clear filters'))

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_FILTER_SET',
            value: [],
        })
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
                layerId: 'ref1',
                layers: {
                    layer1: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
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
            },
            mapViews: [
                ...twoEligibleLayers,
                {
                    ...referenceLayer(),
                    combinedJoinConfig: {
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
            ],
        })

        fireEvent.click(screen.getByLabelText('Choose layers to combine'))
        fireEvent.click(screen.getByRole('checkbox', { name: 'Layer 1' }))

        expect(store.getActions()).toEqual([
            {
                type: 'DATA_TABLE_JOIN_CONFIG_SET',
                layerId: 'ref1',
                layers: {
                    layer2: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        ])
    })
})

describe('BottomPanel Combined joinConfig prop stability', () => {
    test('passes CombinedDataTable the same joinConfig object reference across an unrelated re-render, instead of a fresh {layers: ...} wrapper every time', () => {
        mockJoinConfigCalls.length = 0
        renderBottomPanel({
            dataTable: {
                ...DEFAULT_DATA_TABLE_STATE,
                openIds: ['layer1', 'layer2'],
                combinedView: true,
            },
            mapViews: [...twoEligibleLayers, referenceLayer()],
        })

        fireEvent.change(screen.getByPlaceholderText('Search all columns'), {
            target: { value: 'a' },
        })
        fireEvent.change(screen.getByPlaceholderText('Search all columns'), {
            target: { value: 'ab' },
        })

        expect(mockJoinConfigCalls.length).toBeGreaterThan(1)
        expect(
            mockJoinConfigCalls.every((c) => c === mockJoinConfigCalls[0])
        ).toBe(true)
    })
})
