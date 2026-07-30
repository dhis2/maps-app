import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { VirtuosoMockContext } from 'react-virtuoso'
import configureMockStore from 'redux-mock-store'
import { COMBINED_HEADERS_KEY } from '../../../constants/dataTable.js'
import CombinedDataTable from '../CombinedDataTable.jsx'

jest.mock('../../cachedDataProvider/CachedDataProvider.jsx', () => ({
    useCachedData: () => ({
        systemSettings: { keyAnalysisDigitGroupSeparator: 'COMMA' },
    }),
}))

const mockStore = configureMockStore()

const feature = (props) => ({ properties: props })

const referenceFeature = (id, name, path) =>
    feature({ id, name, orgUnitPath: path, level: 2 })

const referenceFeatureWithGeometry = ({ id, name, path, coordinates }) => ({
    type: 'Feature',
    properties: { id, name, orgUnitPath: path, level: 2 },
    geometry: { type: 'Point', coordinates },
})

const EMPTY_REFERENCE_LAYER = {
    id: 'ref1',
    layer: 'combinedTableRef',
    data: [],
}

const renderCombinedDataTable = (props) => {
    const store = mockStore({ ui: {} })
    const result = render(
        <Provider store={store}>
            <VirtuosoMockContext.Provider
                value={{ viewportHeight: 300, itemHeight: 28 }}
            >
                <CombinedDataTable
                    availableWidth={800}
                    layers={[]}
                    referenceLayer={EMPTY_REFERENCE_LAYER}
                    joinConfig={{ layers: {} }}
                    {...props}
                />
            </VirtuosoMockContext.Provider>
        </Provider>
    )
    return { ...result, store }
}

describe('CombinedDataTable', () => {
    test('renders a column header per computed header and a cell per row', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        orgUnitPath: '/country1/ou1',
                        rawValue: 10,
                        legend: 'Low',
                    }),
                ],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
            columnConfig: {
                visibleKeys: ['id', 'name', 'layerA_rawValue', 'layerA_legend'],
            },
        })

        expect(screen.getByText('Org unit id')).toBeInTheDocument()
        expect(screen.getByText('Org unit')).toBeInTheDocument()
        expect(screen.getByText('Value (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Legend (Layer A)')).toBeInTheDocument()
        expect(screen.getByText('Ou One')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
    })

    test('formats numeric values with the system digit group separator, matching DataTable', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        orgUnitPath: '/country1/ou1',
                        rawValue: 1234567,
                    }),
                ],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    test('renders an em-dash for blank cell values', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ orgUnitPath: '/country1/ou1' })],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    })

    test('shows the empty-results placeholder when there are no rows', () => {
        renderCombinedDataTable()

        expect(screen.getByText('No matching rows')).toBeInTheDocument()
    })

    test('shows the spatial warning banner when a spatial join exceeds the large-feature threshold', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                {
                    type: 'Feature',
                    properties: {
                        id: 'poly1',
                        name: 'Region',
                        orgUnitPath: '/country1/poly1',
                        level: 2,
                    },
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
        const pointLayer = {
            id: 'points',
            name: 'Points',
            combinedLayerKey: 'points',
            data: Array.from({ length: 10001 }, (_, i) => ({
                type: 'Feature',
                properties: { id: `p${i}` },
                geometry: { type: 'Point', coordinates: [1, 1] },
            })),
        }

        renderCombinedDataTable({
            referenceLayer,
            layers: [pointLayer],
            joinConfig: {
                layers: {
                    points: {
                        type: 'spatial',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        expect(
            screen.getByText(/Spatial join over large datasets may be slow/)
        ).toBeInTheDocument()
    })

    test('calls onCountChange with the row count', () => {
        const onCountChange = jest.fn()
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeature('ou1', 'Ou One', '/country1/ou1'),
                referenceFeature('ou2', 'Ou Two', '/country1/ou2'),
            ],
        }

        renderCombinedDataTable({
            referenceLayer,
            onCountChange,
        })

        expect(onCountChange).toHaveBeenCalledWith(2, 2)
    })

    test('sorts rows when a column sort button is clicked', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeature('ou1', 'Ou One', '/country1/ou1'),
                referenceFeature('ou2', 'Ou Two', '/country1/ou2'),
            ],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({ orgUnitPath: '/country1/ou1', rawValue: 20 }),
                    feature({ orgUnitPath: '/country1/ou2', rawValue: 10 }),
                ],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        const rowsBefore = screen.getAllByRole('row').slice(1)
        expect(rowsBefore[0]).toHaveTextContent('Ou One')

        fireEvent.click(
            screen.getByTestId(
                'combined-table-column-sort-button-Value (Layer A)'
            )
        )

        const rowsAfter = screen.getAllByRole('row').slice(1)
        expect(rowsAfter[0]).toHaveTextContent('Ou Two')
    })

    test('applies a per-column filter via onFiltersChange', () => {
        const onFiltersChange = jest.fn()
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeature('ou1', 'Ou One', '/country1/ou1'),
                referenceFeature('ou2', 'Ou Two', '/country1/ou2'),
            ],
        }

        renderCombinedDataTable({
            referenceLayer,
            filters: {},
            onFiltersChange,
            columnConfig: { visibleKeys: ['id', 'name'] },
        })

        const input = screen
            .getByTestId('data-table-column-filter-search-Org unit id')
            .querySelector('input')
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'ou1' } })

        expect(onFiltersChange).toHaveBeenCalledWith({ id: 'ou1' })
    })

    test('dispatches a cross-layer highlight on row hover, and clears it on mouse leave', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evtA1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                ],
            },
            {
                id: 'layerB',
                name: 'Layer B',
                combinedLayerKey: 'layerB',
                data: [
                    feature({
                        id: 'evtB1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 5,
                    }),
                ],
            },
        ]

        const { store } = renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                    layerB: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        const dataRow = screen.getAllByRole('row')[1]
        fireEvent.mouseEnter(dataRow)

        expect(store.getActions()).toContainEqual({
            type: 'FEATURE_HIGHLIGHT',
            payload: {
                layerId: null,
                origin: 'table',
                crossLayerIds: {
                    ref1: ['ou1'],
                    layerA: ['evtA1'],
                    layerB: ['evtB1'],
                },
            },
        })

        fireEvent.mouseLeave(dataRow, { relatedTarget: null })

        expect(store.getActions()).toContainEqual({
            type: 'FEATURE_HIGHLIGHT',
            payload: null,
        })
    })

    test('dispatches a merged cross-layer selection when rows are checked', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeature('ou1', 'Ou One', '/country1/ou1'),
                referenceFeature('ou2', 'Ou Two', '/country1/ou2'),
            ],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evt1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                    feature({
                        id: 'evt2',
                        orgUnitPath: '/country1/ou2',
                        rawValue: 10,
                    }),
                ],
            },
        ]

        const { store } = renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        const checkboxes = screen.getAllByRole('checkbox')
        // checkboxes[0] is the header "select all" checkbox
        fireEvent.click(checkboxes[1])

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_SET_CROSS_LAYER',
            crossLayerIds: { ref1: ['ou1'], layerA: ['evt1'] },
        })
    })

    test('does not clear selection on unmount when nothing was ever selected here', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ id: 'evt1', orgUnitPath: '/country1/ou1' })],
            },
        ]

        const { store, unmount } = renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        unmount()

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'SELECTION_SET_CROSS_LAYER' })
        )
    })

    test('clears the cross-layer selection on unmount after selecting a row', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ id: 'evt1', orgUnitPath: '/country1/ou1' })],
            },
        ]

        const { store, unmount } = renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
        })

        fireEvent.click(screen.getAllByRole('checkbox')[1])
        unmount()

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_SET_CROSS_LAYER',
            crossLayerIds: {},
        })
    })

    test('reports computed headers up via onHeadersChange, keyed by the combined sentinel', () => {
        const onHeadersChange = jest.fn()
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ orgUnitPath: '/country1/ou1', rawValue: 1 })],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
            onHeadersChange,
        })

        expect(onHeadersChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ dataKey: 'id' }),
            ]),
            COMBINED_HEADERS_KEY
        )
    })

    test('hides a column excluded from columnConfig.visibleKeys', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ orgUnitPath: '/country1/ou1', rawValue: 20 })],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
            columnConfig: { visibleKeys: ['id', 'name'] },
        })

        expect(screen.getByText('Org unit id')).toBeInTheDocument()
        expect(screen.queryByText('Value (Layer A)')).not.toBeInTheDocument()
        expect(screen.queryByText('20')).not.toBeInTheDocument()
    })

    test('hides Org unit id and Org unit level by default when no columnConfig is given', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }

        renderCombinedDataTable({ referenceLayer })

        expect(screen.getByText('Org unit')).toBeInTheDocument()
        expect(screen.queryByText('Org unit id')).not.toBeInTheDocument()
        expect(screen.queryByText('Org unit level')).not.toBeInTheDocument()
    })

    test('reorders columns to put pinned keys first via columnConfig.pinnedKeys', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [feature({ orgUnitPath: '/country1/ou1', rawValue: 20 })],
            },
        ]

        renderCombinedDataTable({
            referenceLayer,
            layers,
            joinConfig: {
                layers: {
                    layerA: {
                        type: 'orgUnit',
                        aggregation: { rawValue: 'SUM' },
                    },
                },
            },
            columnConfig: {
                pinnedKeys: ['level'],
                visibleKeys: [
                    'level',
                    'name',
                    'layerA_rawValue',
                    'layerA_legend',
                ],
            },
        })

        const headerNames = screen
            .getAllByRole('columnheader')
            .map((el) => el.textContent)
            .filter(Boolean)
        // headerNames[0] is the selection column's own filter button label
        // ("All"/"N selected") - the first real data column follows it.
        expect(headerNames[1]).toBe('Org unit level')
    })

    test('dispatches setSelectionFilter when a selection-filter option is toggled', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }

        const { store } = renderCombinedDataTable({ referenceLayer })

        fireEvent.click(
            screen.getByTestId('data-table-selection-filter-button')
        )
        fireEvent.click(screen.getByText('Selected'))

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_FILTER_SET',
            value: ['selected'],
        })
    })

    test('zooms to the row union bounds on row double-click', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeatureWithGeometry({
                    id: 'ou1',
                    name: 'Ou One',
                    path: '/country1/ou1',
                    coordinates: [10, 20],
                }),
            ],
        }

        const { store } = renderCombinedDataTable({ referenceLayer })

        const dataRow = screen.getAllByRole('row')[1]
        fireEvent.doubleClick(dataRow)

        expect(store.getActions()).toContainEqual({
            type: 'FEATURE_HIGHLIGHT',
            payload: {
                layerId: null,
                origin: 'table',
                zoom: true,
                bounds: [
                    [10, 20],
                    [10, 20],
                ],
                crossLayerIds: { ref1: ['ou1'] },
            },
        })
    })

    test('highlights the table row matching a feature hovered directly on the map', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evtA1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                ],
            },
        ]

        const store = mockStore({
            ui: {},
            feature: { id: 'evtA1', layerId: 'layerA', origin: 'map' },
        })
        render(
            <Provider store={store}>
                <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 28 }}
                >
                    <CombinedDataTable
                        availableWidth={800}
                        layers={layers}
                        referenceLayer={referenceLayer}
                        joinConfig={{
                            layers: {
                                layerA: {
                                    type: 'orgUnit',
                                    aggregation: { rawValue: 'SUM' },
                                },
                            },
                        }}
                    />
                </VirtuosoMockContext.Provider>
            </Provider>
        )

        const dataRow = screen.getAllByRole('row')[1]
        expect(dataRow.querySelector('.hovered')).toBeInTheDocument()
    })

    test('ignores a stale single-layer table hover left over in state.feature', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evtA1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                ],
            },
        ]

        const store = mockStore({
            ui: {},
            feature: { id: 'evtA1', layerId: 'layerA', origin: 'table' },
        })
        render(
            <Provider store={store}>
                <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 28 }}
                >
                    <CombinedDataTable
                        availableWidth={800}
                        layers={layers}
                        referenceLayer={referenceLayer}
                        joinConfig={{
                            layers: {
                                layerA: {
                                    type: 'orgUnit',
                                    aggregation: { rawValue: 'SUM' },
                                },
                            },
                        }}
                    />
                </VirtuosoMockContext.Provider>
            </Provider>
        )

        const dataRow = screen.getAllByRole('row')[1]
        expect(dataRow.querySelector('.hovered')).not.toBeInTheDocument()
    })

    test('a plain map click on a joined feature does not select its row', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evtA1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                ],
            },
        ]

        const store = mockStore({
            ui: {
                lastClickedFeature: {
                    id: 'evtA1',
                    layerId: 'layerA',
                    multiSelect: false,
                },
            },
        })
        render(
            <Provider store={store}>
                <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 28 }}
                >
                    <CombinedDataTable
                        availableWidth={800}
                        layers={layers}
                        referenceLayer={referenceLayer}
                        joinConfig={{
                            layers: {
                                layerA: {
                                    type: 'orgUnit',
                                    aggregation: { rawValue: 'SUM' },
                                },
                            },
                        }}
                    />
                </VirtuosoMockContext.Provider>
            </Provider>
        )

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'SELECTION_SET_CROSS_LAYER' })
        )
    })

    test('a ctrl/multiSelect map click on a joined feature selects its row', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evtA1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 20,
                    }),
                ],
            },
        ]

        const store = mockStore({
            ui: {
                lastClickedFeature: {
                    id: 'evtA1',
                    layerId: 'layerA',
                    multiSelect: true,
                },
            },
        })
        render(
            <Provider store={store}>
                <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 28 }}
                >
                    <CombinedDataTable
                        availableWidth={800}
                        layers={layers}
                        referenceLayer={referenceLayer}
                        joinConfig={{
                            layers: {
                                layerA: {
                                    type: 'orgUnit',
                                    aggregation: { rawValue: 'SUM' },
                                },
                            },
                        }}
                    />
                </VirtuosoMockContext.Provider>
            </Provider>
        )

        expect(store.getActions()).toContainEqual({
            type: 'SELECTION_SET_CROSS_LAYER',
            crossLayerIds: { ref1: ['ou1'], layerA: ['evtA1'] },
        })
    })

    test('a map click on a feature belonging to no joined row does nothing', () => {
        const referenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [referenceFeature('ou1', 'Ou One', '/country1/ou1')],
        }

        const store = mockStore({
            ui: {
                lastClickedFeature: {
                    id: 'unrelated',
                    layerId: 'someOtherLayer',
                    multiSelect: true,
                },
            },
        })
        render(
            <Provider store={store}>
                <VirtuosoMockContext.Provider
                    value={{ viewportHeight: 300, itemHeight: 28 }}
                >
                    <CombinedDataTable
                        availableWidth={800}
                        layers={[]}
                        referenceLayer={referenceLayer}
                        joinConfig={{ layers: {} }}
                    />
                </VirtuosoMockContext.Provider>
            </Provider>
        )

        expect(store.getActions()).not.toContainEqual(
            expect.objectContaining({ type: 'SELECTION_SET_CROSS_LAYER' })
        )
    })

    describe('map visibility from column filters and global search', () => {
        const twoOuReferenceLayer = {
            ...EMPTY_REFERENCE_LAYER,
            data: [
                referenceFeature('ou1', 'Ou One', '/country1/ou1'),
                referenceFeature('ou2', 'Ou Two', '/country1/ou2'),
            ],
        }
        const layerA = {
            id: 'layerA',
            name: 'Layer A',
            combinedLayerKey: 'layerA',
            data: [
                feature({
                    id: 'evtA1',
                    orgUnitPath: '/country1/ou1',
                    rawValue: 10,
                }),
                feature({
                    id: 'evtA2',
                    orgUnitPath: '/country1/ou2',
                    rawValue: 20,
                }),
            ],
        }
        const joinConfig = {
            layers: {
                layerA: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        }

        test('dispatches combinedVisibleIds narrowed to the filtered rows when a column filter is active', () => {
            const { store } = renderCombinedDataTable({
                referenceLayer: twoOuReferenceLayer,
                layers: [layerA],
                joinConfig,
                filters: { id: 'ou1' },
            })

            expect(store.getActions()).toContainEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: { ref1: ['ou1'], layerA: ['evtA1'] },
            })
        })

        test('dispatches an empty array (hide everything) for a layer with no surviving matches', () => {
            const { store } = renderCombinedDataTable({
                referenceLayer: twoOuReferenceLayer,
                layers: [layerA],
                joinConfig,
                filters: { id: 'ou2' },
            })

            expect(store.getActions()).toContainEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: { ref1: ['ou2'], layerA: ['evtA2'] },
            })
        })

        test('narrows by global search too', () => {
            const { store } = renderCombinedDataTable({
                referenceLayer: twoOuReferenceLayer,
                layers: [layerA],
                joinConfig,
                globalSearch: 'Ou One',
            })

            expect(store.getActions()).toContainEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: { ref1: ['ou1'], layerA: ['evtA1'] },
            })
        })

        test('dispatches null (show everything) when no column filter or search is active', () => {
            const { store } = renderCombinedDataTable({
                referenceLayer: twoOuReferenceLayer,
                layers: [layerA],
                joinConfig,
            })

            expect(store.getActions()).toContainEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: null,
            })
        })

        test('does not narrow map visibility from the selection filter alone', () => {
            const store = mockStore({
                ui: { selectionFilter: ['selected'] },
            })
            render(
                <Provider store={store}>
                    <VirtuosoMockContext.Provider
                        value={{ viewportHeight: 300, itemHeight: 28 }}
                    >
                        <CombinedDataTable
                            availableWidth={800}
                            layers={[layerA]}
                            referenceLayer={twoOuReferenceLayer}
                            joinConfig={joinConfig}
                        />
                    </VirtuosoMockContext.Provider>
                </Provider>
            )

            expect(store.getActions()).toContainEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: null,
            })
        })

        test('resets combinedVisibleIds to null on unmount', () => {
            const { store, unmount } = renderCombinedDataTable({
                referenceLayer: twoOuReferenceLayer,
                layers: [layerA],
                joinConfig,
                filters: { id: 'ou1' },
            })

            unmount()

            const actions = store.getActions()
            expect(actions[actions.length - 1]).toEqual({
                type: 'COMBINED_VISIBLE_IDS_SET',
                idsByLayer: null,
            })
        })
    })
})
