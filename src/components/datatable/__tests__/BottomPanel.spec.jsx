import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import WindowDimensionsProvider from '../../WindowDimensionsProvider.jsx'
import BottomPanel from '../BottomPanel.jsx'

jest.mock('../DataTable.jsx', () => {
    const DataTableMock = () => <div data-testid="datatable-mock" />
    DataTableMock.displayName = 'DataTableMock'
    return DataTableMock
})

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: ',' },
    }),
}))

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

const renderBottomPanel = ({ dataTable, mapViews } = {}) => {
    const store = mockStore({
        ui: {
            dataTableHeight: DATA_TABLE_HEIGHT,
            showOnlyFeaturesInView: false,
            selectionFilter: [],
            highlightColor: null,
        },
        dataTable: dataTable ?? {
            openIds: ['layer1'],
            activeLayerId: 'layer1',
            isPanelVisible: true,
        },
        map: {
            mapViews: mapViews ?? [{ id: 'layer1', name: 'Layer 1' }],
        },
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

describe('BottomPanel layer selection', () => {
    const eligibleLayer = (id, name) => ({
        id,
        name,
        layer: THEMATIC_LAYER,
        isLoaded: true,
        data: [{}],
    })
    const mapViews = [
        eligibleLayer('layer1', 'Layer 1'),
        eligibleLayer('layer2', 'Layer 2'),
    ]

    test('restores the stored activeLayerId as the selected value on mount', () => {
        renderBottomPanel({
            dataTable: {
                openIds: ['layer1', 'layer2'],
                activeLayerId: 'layer2',
                isPanelVisible: true,
            },
            mapViews,
        })

        expect(screen.getByTestId('data-table-layer-selector')).toHaveValue(
            'layer2'
        )
    })

    test('falls back to the last open tab when the stored activeLayerId is stale (e.g. its layer was removed)', () => {
        renderBottomPanel({
            dataTable: {
                openIds: ['layer1', 'layer2'],
                activeLayerId: 'removed-layer',
                isPanelVisible: true,
            },
            mapViews,
        })

        expect(screen.getByTestId('data-table-layer-selector')).toHaveValue(
            'layer2'
        )
    })

    test('selecting an already-open layer dispatches setActiveDataTableLayer only', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                openIds: ['layer1', 'layer2'],
                activeLayerId: 'layer1',
                isPanelVisible: true,
            },
            mapViews,
        })

        fireEvent.change(screen.getByTestId('data-table-layer-selector'), {
            target: { value: 'layer2' },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_ACTIVE_LAYER_SET', id: 'layer2' },
        ])
    })

    test('selecting an eligible-but-not-open layer also opens it', () => {
        const { store } = renderBottomPanel({
            dataTable: {
                openIds: ['layer1'],
                activeLayerId: 'layer1',
                isPanelVisible: true,
            },
            mapViews,
        })

        fireEvent.change(screen.getByTestId('data-table-layer-selector'), {
            target: { value: 'layer2' },
        })

        expect(store.getActions()).toEqual([
            { type: 'DATA_TABLE_ACTIVE_LAYER_SET', id: 'layer2' },
            { type: 'DATA_TABLE_TOGGLE', id: 'layer2' },
        ])
    })
})
