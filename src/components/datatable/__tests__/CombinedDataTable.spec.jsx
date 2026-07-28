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

const EMPTY_REFERENCE_LAYER = {
    id: 'ref1',
    layer: 'combinedTableRef',
    data: [],
}

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
        })

        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.getByText('Name')).toBeInTheDocument()
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
        })

        const input = screen
            .getByTestId('data-table-column-filter-search-ID')
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

        expect(screen.getByText('ID')).toBeInTheDocument()
        expect(screen.queryByText('Value (Layer A)')).not.toBeInTheDocument()
        expect(screen.queryByText('20')).not.toBeInTheDocument()
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
            columnConfig: { pinnedKeys: ['level'] },
        })

        const headerNames = screen
            .getAllByRole('columnheader')
            .map((el) => el.textContent)
            .filter(Boolean)
        expect(headerNames[0]).toBe('Level')
    })
})
