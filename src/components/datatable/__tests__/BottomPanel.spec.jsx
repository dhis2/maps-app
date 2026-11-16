import { render, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import WindowDimensionsProvider from '../../WindowDimensionsProvider.jsx'
import BottomPanel from '../BottomPanel.jsx'

jest.mock('../DataTable.jsx', () => {
    const DataTableMock = () => <div data-testid="datatable-mock" />
    DataTableMock.displayName = 'DataTableMock'
    return DataTableMock
})
jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({ systemSettings: {} }),
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

const renderBottomPanel = ({
    dataTable = 'layer1',
    mapViews = [{ id: 'layer1', name: 'Layer 1' }],
} = {}) => {
    const store = mockStore({
        ui: {
            dataTableHeight: DATA_TABLE_HEIGHT,
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
    return { handle: container.querySelector('.resizeHandle') }
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

describe('BottomPanel toolbar', () => {
    test('shows the name of the layer whose table is open', () => {
        renderBottomPanel({
            dataTable: 'layer2',
            mapViews: [
                { id: 'layer1', name: 'Layer 1' },
                { id: 'layer2', name: 'Layer 2' },
            ],
        })

        expect(screen.getByText('Layer 2')).toBeInTheDocument()
        expect(screen.queryByText('Layer 1')).not.toBeInTheDocument()
    })
})
