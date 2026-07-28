import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { VirtuosoMockContext } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import useOrgUnitAncestorNames from '../../../hooks/useOrgUnitAncestorNames.js'
import CombinedDataTable from '../CombinedDataTable.jsx'

jest.mock('../../../hooks/useOrgUnitAncestorNames.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'COMMA' },
    }),
}))

const mockStore = configureMockStore()

beforeEach(() => {
    useOrgUnitAncestorNames.mockReturnValue({
        idToName: new Map(),
        loading: false,
    })
})

const feature = (props) => ({ properties: props })

const renderCombinedDataTable = (props) => {
    const store = mockStore({})
    const result = render(
        <Provider store={store}>
            <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 28 }}
            >
                <CombinedDataTable
                    availableWidth={800}
                    layers={[]}
                    joinConfig={{
                        level: 'orgUnit',
                        layerIds: [],
                        pointLayerId: null,
                        polygonLayerId: null,
                    }}
                    {...props}
                />
            </VirtuosoMockContext.Provider>
        </Provider>
    )
    return { ...result, store }
}

describe('CombinedDataTable', () => {
    test('renders a column header per computed header and a cell per row', () => {
        useOrgUnitAncestorNames.mockReturnValue({
            idToName: new Map([['ou1', 'Ou One']]),
            loading: false,
        })

        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        orgUnitId: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        level: 2,
                        rawValue: 10,
                        legend: 'Low',
                    }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Value (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Legend (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Ou One')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
    })

    test('renders an em-dash for blank cell values', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [feature({ orgUnitId: 'ou1' })],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    })

    test('shows the empty-results placeholder when there are no rows', () => {
        renderCombinedDataTable({ layers: [] })

        expect(screen.getByText('No matching rows')).toBeInTheDocument()
    })

    test('shows the spatial warning banner when a spatial join exceeds the large-feature threshold', () => {
        const pointLayer = {
            id: 'points',
            name: 'Points',
            data: Array.from({ length: 10001 }, (_, i) => ({
                type: 'Feature',
                properties: { id: `p${i}` },
                geometry: { type: 'Point', coordinates: [1, 1] },
            })),
        }
        const polygonLayer = {
            id: 'polygons',
            name: 'Polygons',
            data: [
                {
                    type: 'Feature',
                    properties: { id: 'poly1', rawValue: 1 },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [0, 0],
                                [2, 0],
                                [2, 2],
                                [0, 2],
                                [0, 0],
                            ],
                        ],
                    },
                },
            ],
        }

        renderCombinedDataTable({
            layers: [pointLayer, polygonLayer],
            joinConfig: {
                level: 'spatial',
                layerIds: [],
                pointLayerId: 'points',
                polygonLayerId: 'polygons',
            },
        })

        expect(
            screen.getByText(/Spatial join over large datasets may be slow/)
        ).toBeInTheDocument()
    })

    test('calls onCountChange with the row count', () => {
        const onCountChange = jest.fn()
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ orgUnitId: 'ou1' }),
                    feature({ orgUnitId: 'ou2' }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
            onCountChange,
        })

        expect(onCountChange).toHaveBeenCalledWith(2, 2)
    })

    test('sorts rows when a column sort button is clicked', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ orgUnitId: 'ou1', rawValue: 20 }),
                    feature({ orgUnitId: 'ou2', rawValue: 10 }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        const rowsBefore = screen.getAllByRole('row').slice(1)
        expect(rowsBefore[0]).toHaveTextContent('ou1')

        fireEvent.click(
            screen.getByTestId(
                'combined-table-column-sort-button-Value (Layer A)'
            )
        )

        const rowsAfter = screen.getAllByRole('row').slice(1)
        expect(rowsAfter[0]).toHaveTextContent('ou2')
    })

    test('applies a per-column filter via onFiltersChange', () => {
        const onFiltersChange = jest.fn()
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ orgUnitId: 'ou1', rawValue: 20 }),
                    feature({ orgUnitId: 'ou2', rawValue: 10 }),
                ],
            },
        ]

        renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
            filters: {},
            onFiltersChange,
        })

        const input = screen
            .getByTestId('data-table-column-filter-search-ID')
            .querySelector('input')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'ou1' } })

        expect(onFiltersChange).toHaveBeenCalledWith({ id: 'ou1' })
    })

    test('dispatches a cross-layer highlight on row hover, and clears it on mouse leave', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ id: 'evtA1', orgUnitId: 'ou1', rawValue: 20 }),
                ],
            },
            {
                id: 'layerB',
                name: 'Layer B',
                data: [feature({ id: 'evtB1', orgUnitId: 'ou1', rawValue: 5 })],
            },
        ]

        const { store } = renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA', 'layerB'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        const dataRow = screen.getAllByRole('row')[1]
        fireEvent.mouseEnter(dataRow)

        expect(store.getActions()).toContainEqual({
            type: 'FEATURE_HIGHLIGHT',
            payload: {
                layerId: null,
                origin: 'table',
                crossLayerIds: { layerA: ['evtA1'], layerB: ['evtB1'] },
            },
        })

        fireEvent.mouseLeave(dataRow, { relatedTarget: null })

        expect(store.getActions()).toContainEqual({
            type: 'FEATURE_HIGHLIGHT',
            payload: null,
        })
    })

    test('dispatches a merged cross-layer selection when rows are checked', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ id: 'evt1', orgUnitId: 'ou1', rawValue: 20 }),
                    feature({ id: 'evt2', orgUnitId: 'ou2', rawValue: 10 }),
                ],
            },
        ]

        const { store } = renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        const checkboxes = screen.getAllByRole('checkbox')
        // checkboxes[0] is the header "select all" checkbox
        fireEvent.click(checkboxes[1])

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_SET_CROSS_LAYER',
            crossLayerIds: { layerA: ['evt1'] },
        })
    })

    test('does not clear selection on unmount when nothing was ever selected here', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [feature({ id: 'evt1', orgUnitId: 'ou1' })],
            },
        ]

        const { store, unmount } = renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        unmount()

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'SELECTION_SET_CROSS_LAYER' })
        )
    })

    test('clears the cross-layer selection on unmount after selecting a row', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [feature({ id: 'evt1', orgUnitId: 'ou1' })],
            },
        ]

        const { store, unmount } = renderCombinedDataTable({
            layers,
            joinConfig: {
                level: 'orgUnit',
                layerIds: ['layerA'],
                pointLayerId: null,
                polygonLayerId: null,
            },
        })

        fireEvent.click(screen.getAllByRole('checkbox')[1])
        unmount()

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_SET_CROSS_LAYER',
            crossLayerIds: {},
        })
    })
})
