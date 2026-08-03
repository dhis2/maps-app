import { renderHook } from '@testing-library/react'
import {
    EARTH_ENGINE_LAYER,
    EVENT_LAYER,
    FACILITY_LAYER,
    THEMATIC_LAYER,
} from '../../../constants/layers.js'
import { useCombinedTableData } from '../useCombinedTableData.js'

const feature = (props) => ({ properties: props })

const findCell = (row, dataKey) => row.find((c) => c.dataKey === dataKey)

const referenceLayer = {
    id: 'ref1',
    data: [
        feature({
            id: 'ou1',
            name: 'Ou One',
            orgUnitPath: '/country1/ou1',
            level: 2,
        }),
        feature({
            id: 'ou2',
            name: 'Ou Two',
            orgUnitPath: '/country1/ou2',
            level: 2,
        }),
    ],
}

describe('useCombinedTableData - org unit join', () => {
    test('joins a direct match by exact org unit path, filling blanks for unmatched reference rows', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 10,
                        legend: 'Low',
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: {
                layerA: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_rawValue',
            'layerA_legend',
        ])
        expect(result.current.headers[0].name).toBe('Org unit id')
        expect(result.current.headers[1].name).toBe('Org unit')
        expect(result.current.rows).toHaveLength(2)

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'name').value).toBe('Ou One')
        expect(findCell(row1, 'layerA_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerA_legend').value).toBe('Low')

        const row2 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou2'
        )
        expect(findCell(row2, 'layerA_rawValue').value).toBe(null)
    })

    test('takes the row name/level directly from the reference layer, not from the participating layer', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'ou1',
                        name: 'Some other name',
                        orgUnitPath: '/country1/ou1',
                        level: 99,
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'name').value).toBe('Ou One')
        expect(findCell(row1, 'level').value).toBe(2)
    })

    test('aggregates several descendant features under the reference org unit using the chosen aggregation type', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evt1',
                        orgUnitPath: '/country1/ou1/facility1',
                        rawValue: 10,
                    }),
                    feature({
                        id: 'evt2',
                        orgUnitPath: '/country1/ou1/facility2',
                        rawValue: 20,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: {
                layerA: {
                    type: 'orgUnit',
                    aggregation: { rawValue: 'AVERAGE' },
                },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(15)
    })

    test('shows blank for a feature whose org unit is an ancestor of the reference, not a descendant', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'country1',
                        orgUnitPath: '/country1',
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        result.current.rows.forEach((row) => {
            expect(findCell(row, 'layerA_rawValue').value).toBe(null)
        })
    })

    test('resolves legend to the shared value when every match agrees, otherwise blank', () => {
        const agreeingLayer = {
            id: 'layerA',
            name: 'Layer A',
            combinedLayerKey: 'layerA',
            data: [
                feature({
                    id: 'evt1',
                    orgUnitPath: '/country1/ou1/f1',
                    legend: 'Low',
                }),
                feature({
                    id: 'evt2',
                    orgUnitPath: '/country1/ou1/f2',
                    legend: 'Low',
                }),
            ],
        }
        const disagreeingLayer = {
            id: 'layerB',
            name: 'Layer B',
            combinedLayerKey: 'layerB',
            data: [
                feature({
                    id: 'evt3',
                    orgUnitPath: '/country1/ou2/f1',
                    legend: 'Low',
                }),
                feature({
                    id: 'evt4',
                    orgUnitPath: '/country1/ou2/f2',
                    legend: 'High',
                }),
            ],
        }
        const joinConfig = {
            layers: {
                layerA: { type: 'orgUnit', aggregation: {} },
                layerB: { type: 'orgUnit', aggregation: {} },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [agreeingLayer, disagreeingLayer],
                referenceLayer,
                joinConfig,
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_legend').value).toBe('Low')

        const row2 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou2'
        )
        expect(findCell(row2, 'layerB_legend').value).toBe(null)
    })

    test('includes rows from layer.dataWithoutCoords, matching the single-layer table', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [],
                dataWithoutCoords: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(10)
    })

    test('excludes features with hasAdditionalGeometry set', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'extra',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 999,
                        hasAdditionalGeometry: true,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(null)
    })

    test('rowFeatureIds always includes the reference layer itself, plus every matching participating feature', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                data: [
                    feature({
                        id: 'evt1',
                        orgUnitPath: '/country1/ou1/f1',
                        rawValue: 10,
                    }),
                    feature({
                        id: 'evt2',
                        orgUnitPath: '/country1/ou1/f2',
                        rawValue: 20,
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        expect(result.current.rowFeatureIds.get('ou1')).toEqual({
            ref1: ['ou1'],
            layerA: ['evt1', 'evt2'],
        })
        // ou2 has no participating match, but the reference feature id is
        // still present so "zoom to feature" always has real bounds.
        expect(result.current.rowFeatureIds.get('ou2')).toEqual({
            ref1: ['ou2'],
        })
    })
})

describe('useCombinedTableData - spatial join', () => {
    const referenceOrgUnitsAsPolygons = {
        id: 'ref1',
        data: [
            {
                type: 'Feature',
                properties: { id: 'ou1', name: 'Ou One', level: 2 },
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

    test('joins a point feature to the reference org unit whose polygon contains it', () => {
        const layers = [
            {
                id: 'points',
                name: 'Points',
                combinedLayerKey: 'points',
                layer: 'geoJsonUrl',
                data: [
                    {
                        type: 'Feature',
                        properties: { id: 'p1', rawValue: 42, legend: 'High' },
                        geometry: { type: 'Point', coordinates: [1, 1] },
                    },
                ],
            },
        ]
        const joinConfig = {
            layers: {
                points: {
                    type: 'spatial',
                    aggregation: { rawValue: 'SUM' },
                },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer: referenceOrgUnitsAsPolygons,
                joinConfig,
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'points_rawValue').value).toBe(42)
        expect(result.current.rowFeatureIds.get('ou1')).toEqual({
            ref1: ['ou1'],
            points: ['p1'],
        })
    })

    test('matches an event feature via its centroid when its geometry is a polygon', () => {
        const layers = [
            {
                id: 'events',
                name: 'Events',
                combinedLayerKey: 'events',
                layer: EVENT_LAYER,
                data: [
                    {
                        type: 'Feature',
                        properties: { id: 'e1' },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [0.5, 0.5],
                                    [1.5, 0.5],
                                    [1.5, 1.5],
                                    [0.5, 1.5],
                                    [0.5, 0.5],
                                ],
                            ],
                        },
                    },
                ],
            },
        ]
        const joinConfig = {
            layers: {
                events: { type: 'spatial', aggregation: {} },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer: referenceOrgUnitsAsPolygons,
                joinConfig,
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        // An unstyled Event layer is count-only (see getCombinedValueDataKeys)
        expect(findCell(row1, 'events_count').value).toBe(1)
    })

    test('matches via centroid regardless of layer type - not just Event/TrackedEntity', () => {
        const layers = [
            {
                id: 'zones',
                name: 'Zones',
                combinedLayerKey: 'zones',
                layer: 'geoJsonUrl',
                data: [
                    {
                        type: 'Feature',
                        properties: { id: 'z1', rawValue: 3 },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [
                                    [0.5, 0.5],
                                    [1.5, 0.5],
                                    [1.5, 1.5],
                                    [0.5, 1.5],
                                    [0.5, 0.5],
                                ],
                            ],
                        },
                    },
                ],
            },
        ]
        const joinConfig = {
            layers: {
                zones: { type: 'spatial', aggregation: { rawValue: 'SUM' } },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer: referenceOrgUnitsAsPolygons,
                joinConfig,
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'zones_rawValue').value).toBe(3)
    })

    test('averages several points falling inside the same reference polygon', () => {
        const layers = [
            {
                id: 'points',
                name: 'Points',
                combinedLayerKey: 'points',
                layer: 'geoJsonUrl',
                data: [
                    {
                        type: 'Feature',
                        properties: { id: 'p1', rawValue: 10 },
                        geometry: { type: 'Point', coordinates: [0.5, 0.5] },
                    },
                    {
                        type: 'Feature',
                        properties: { id: 'p2', rawValue: 20 },
                        geometry: { type: 'Point', coordinates: [1.5, 1.5] },
                    },
                ],
            },
        ]
        const joinConfig = {
            layers: {
                points: {
                    type: 'spatial',
                    aggregation: { rawValue: 'AVERAGE' },
                },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer: referenceOrgUnitsAsPolygons,
                joinConfig,
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'points_rawValue').value).toBe(15)
    })

    test('sets spatialWarning when a spatially-joined layer exceeds the large-feature threshold', () => {
        const layers = [
            {
                id: 'points',
                name: 'Points',
                combinedLayerKey: 'points',
                layer: 'event',
                data: Array.from({ length: 10001 }, (_, i) => ({
                    type: 'Feature',
                    properties: { id: `p${i}` },
                    geometry: { type: 'Point', coordinates: [1, 1] },
                })),
            },
        ]
        const joinConfig = {
            layers: { points: { type: 'spatial', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer: referenceOrgUnitsAsPolygons,
                joinConfig,
            })
        )

        expect(result.current.spatialWarning).toBe(true)
    })
})

describe('useCombinedTableData - sorting and filtering', () => {
    const layers = [
        {
            id: 'layerA',
            name: 'Layer A',
            combinedLayerKey: 'layerA',
            data: [
                feature({
                    id: 'ou1',
                    orgUnitPath: '/country1/ou1',
                    rawValue: 30,
                }),
                feature({
                    id: 'ou2',
                    orgUnitPath: '/country1/ou2',
                    rawValue: 10,
                }),
            ],
        },
    ]
    const joinConfig = {
        layers: { layerA: { type: 'orgUnit', aggregation: {} } },
    }

    test('sorts rows by a numeric column ascending', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                sortField: 'layerA_rawValue',
                sortDirection: 'asc',
            })
        )

        expect(result.current.rows.map((r) => findCell(r, 'id').value)).toEqual(
            ['ou2', 'ou1']
        )
    })

    test('sorts rows by a numeric column descending', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                sortField: 'layerA_rawValue',
                sortDirection: 'desc',
            })
        )

        expect(result.current.rows.map((r) => findCell(r, 'id').value)).toEqual(
            ['ou1', 'ou2']
        )
    })

    test('applies a per-column filter', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                filters: { layerA_rawValue: '>15' },
            })
        )

        expect(result.current.rows.map((r) => findCell(r, 'id').value)).toEqual(
            ['ou1']
        )
    })

    test('applies global search across string columns', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                globalSearch: 'Ou Two',
            })
        )

        expect(result.current.rows.map((r) => findCell(r, 'id').value)).toEqual(
            ['ou2']
        )
    })

    test('exposes distinct column values for the filter popover, sorted ascending by default', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        expect(result.current.columnOptions.layerA_rawValue).toEqual([
            { value: '10' },
            { value: '30' },
        ])
    })

    test('keeps the same headers array reference across filter/sort/selection-only changes - a changed reference makes useColumnWidths.js reset and re-measure column widths on every keystroke', () => {
        const { result, rerender } = renderHook(
            (props) => useCombinedTableData(props),
            {
                initialProps: {
                    layers,
                    referenceLayer,
                    joinConfig,
                    sortField: null,
                    sortDirection: 'asc',
                    filters: {},
                    globalSearch: '',
                    selectedIdSet: new Set(),
                },
            }
        )
        const firstHeaders = result.current.headers

        rerender({
            layers,
            referenceLayer,
            joinConfig,
            sortField: 'layerA_rawValue',
            sortDirection: 'desc',
            filters: { layerA_rawValue: '>15' },
            globalSearch: 'ou',
            selectedIdSet: new Set(['ou1']),
        })

        expect(result.current.headers).toBe(firstHeaders)
    })
})

describe('useCombinedTableData - empty input', () => {
    test('returns an empty result when the reference layer has no org units', () => {
        const joinConfig = { layers: {} }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [],
                referenceLayer: { id: 'ref1', data: [] },
                joinConfig,
            })
        )

        expect(result.current).toEqual({
            headers: [],
            rows: [],
            rowFeatureIds: new Map(),
            columnOptions: {},
            spatialWarning: false,
        })
    })

    test('still returns one row per reference org unit when there are no participating layers', () => {
        const joinConfig = { layers: {} }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers: [], referenceLayer, joinConfig })
        )

        expect(result.current.rows).toHaveLength(2)
        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
        ])
    })
})

describe('useCombinedTableData - Earth Engine value columns', () => {
    // Earth Engine layers never carry their value(s) directly on feature
    // properties they're computed client-side into state.aggregations
    test('merges aggregation stats in and generates one joinable column per stat, with no generic legend column', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['mean', 'max'],
                legend: { title: 'NDVI' },
                data: [feature({ id: 'f1', orgUnitPath: '/country1/ou1' })],
            },
        ]
        const joinConfig = {
            layers: {
                layerA: {
                    type: 'orgUnit',
                    aggregation: { mean: 'SUM', max: 'SUM' },
                },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                aggregations: { layerA: { f1: { mean: 12.3, max: 20 } } },
            })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_mean',
            'layerA_max',
        ])
        expect(
            result.current.headers.find((h) => h.dataKey === 'layerA_mean').name
        ).toBe('Mean Ndvi (Layer A)')

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_mean').value).toBe(12.3)
        expect(findCell(row1, 'layerA_max').value).toBe(20)
    })

    test('merges classified aggregation values in and generates one column per legend class', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'percentage',
                legend: {
                    items: [
                        { value: 1, name: 'Forest' },
                        { value: 2, name: 'Water' },
                    ],
                },
                data: [feature({ id: 'f1', orgUnitPath: '/country1/ou1' })],
            },
        ]
        const joinConfig = {
            layers: {
                layerA: {
                    type: 'orgUnit',
                    aggregation: { 1: 'SUM', 2: 'SUM' },
                },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                aggregations: { layerA: { f1: { 1: 45.2, 2: 12.1 } } },
            })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_1',
            'layerA_2',
        ])
        expect(
            result.current.headers.find((h) => h.dataKey === 'layerA_1').name
        ).toBe('Forest (Layer A)')

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_1').value).toBe(45.2)
        expect(findCell(row1, 'layerA_2').value).toBe(12.1)
    })
})

describe('useCombinedTableData - thematic timeline/split-by-period value columns', () => {
    const periods = [
        { id: 'p1', name: 'Jan 2023' },
        { id: 'p2', name: 'Feb 2023' },
    ]
    const valuesByPeriod = {
        p1: { f1: { value: 10, legend: 'Low' } },
        p2: { f1: { value: 20, legend: 'High' } },
    }

    test('TIMELINE: current column resolves from the active period, plus one fixed column per period', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: THEMATIC_LAYER,
                renderingStrategy: 'TIMELINE',
                periods,
                valuesByPeriod,
                data: [feature({ id: 'f1', orgUnitPath: '/country1/ou1' })],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                externalPeriod: periods[0],
            })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_rawValue',
            'layerA_period_p1_rawValue',
            'layerA_period_p2_rawValue',
            'layerA_legend',
        ])

        const currentHeader = result.current.headers.find(
            (h) => h.dataKey === 'layerA_rawValue'
        )
        expect(currentHeader.name).toBe('Value (Layer A, Jan 2023)')
        expect(currentHeader.configName).toBe('Value (Layer A, Current period)')

        const legendHeader = result.current.headers.find(
            (h) => h.dataKey === 'layerA_legend'
        )
        expect(legendHeader.name).toBe('Legend (Layer A, Jan 2023)')
        expect(legendHeader.configName).toBe('Legend (Layer A, Current period)')

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerA_period_p1_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerA_period_p2_rawValue').value).toBe(20)
        expect(findCell(row1, 'layerA_legend').value).toBe('Low')
    })

    test('SPLIT_BY_PERIOD: only fixed per-period columns, no current column, no legend column', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: THEMATIC_LAYER,
                renderingStrategy: 'SPLIT_BY_PERIOD',
                periods,
                valuesByPeriod,
                data: [feature({ id: 'f1', orgUnitPath: '/country1/ou1' })],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, referenceLayer, joinConfig })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_period_p1_rawValue',
            'layerA_period_p2_rawValue',
        ])

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_period_p1_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerA_period_p2_rawValue').value).toBe(20)
    })

    test('aggregates several matched features per period using one shared aggregation type', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: THEMATIC_LAYER,
                renderingStrategy: 'TIMELINE',
                periods,
                valuesByPeriod: {
                    p1: { f1: { value: 10 }, f2: { value: 30 } },
                    p2: { f1: { value: 20 }, f2: { value: 40 } },
                },
                data: [
                    feature({ id: 'f1', orgUnitPath: '/country1/ou1' }),
                    feature({ id: 'f2', orgUnitPath: '/country1/ou1' }),
                ],
            },
        ]
        const joinConfig = {
            layers: {
                layerA: { type: 'orgUnit', aggregation: { rawValue: 'SUM' } },
            },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                externalPeriod: periods[0],
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(40)
        expect(findCell(row1, 'layerA_period_p1_rawValue').value).toBe(40)
        expect(findCell(row1, 'layerA_period_p2_rawValue').value).toBe(60)
    })

    test('dead-reference regression: value/legend are read from valuesByPeriod, never from raw feature properties', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                combinedLayerKey: 'layerA',
                layer: THEMATIC_LAYER,
                renderingStrategy: 'TIMELINE',
                periods,
                valuesByPeriod,
                data: [
                    feature({
                        id: 'f1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 9999,
                        legend: 'Bogus',
                    }),
                ],
            },
        ]
        const joinConfig = {
            layers: { layerA: { type: 'orgUnit', aggregation: {} } },
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers,
                referenceLayer,
                joinConfig,
                externalPeriod: periods[0],
            })
        )

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'layerA_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerA_legend').value).toBe('Low')
    })
})

describe('useCombinedTableData - show only features in view', () => {
    const referenceFeature = ({ id, name, path, coordinates }) => ({
        type: 'Feature',
        properties: { id, name, orgUnitPath: path, level: 2 },
        geometry: { type: 'Point', coordinates },
    })

    const referenceLayerWithGeometry = {
        id: 'ref1',
        data: [
            referenceFeature({
                id: 'ou1',
                name: 'Ou One',
                path: '/country1/ou1',
                coordinates: [1, 1],
            }),
            referenceFeature({
                id: 'ou2',
                name: 'Ou Two',
                path: '/country1/ou2',
                coordinates: [10, 10],
            }),
        ],
    }

    test('includes every reference org unit when showOnlyFeaturesInView is false, regardless of mapBounds', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [],
                referenceLayer: referenceLayerWithGeometry,
                joinConfig: { layers: {} },
                showOnlyFeaturesInView: false,
                mapBounds: [0, 0, 2, 2],
            })
        )

        expect(result.current.rows).toHaveLength(2)
    })

    test('only includes reference org units within mapBounds when showOnlyFeaturesInView is true', () => {
        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [],
                referenceLayer: referenceLayerWithGeometry,
                joinConfig: { layers: {} },
                showOnlyFeaturesInView: true,
                mapBounds: [0, 0, 2, 2],
            })
        )

        expect(result.current.rows.map((r) => findCell(r, 'id').value)).toEqual(
            ['ou1']
        )
    })
})

describe('useCombinedTableData - categorical/count value columns', () => {
    const facilityLayer = (data) => ({
        id: 'facility1',
        name: 'Facilities',
        combinedLayerKey: 'facility1',
        layer: FACILITY_LAYER,
        organisationUnitGroupSet: { id: 'groupSet1' },
        legend: {
            items: [
                { id: 'group1', name: 'Hospital' },
                { id: 'group2', name: 'Clinic' },
            ],
        },
        data,
    })

    test('a category column reflects the matched-feature count for that category, and the shared categoryDisplayType setting switches every category column to a percentage together', () => {
        const layer = facilityLayer([
            feature({
                id: 'f1',
                orgUnitPath: '/country1/ou1',
                dimensions: { groupSet1: 'group1' },
            }),
            feature({
                id: 'f2',
                orgUnitPath: '/country1/ou1',
                dimensions: { groupSet1: 'group2' },
            }),
        ])

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: { facility1: { type: 'orgUnit', aggregation: {} } },
                },
            })
        )
        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'facility1_group1').value).toBe(1)

        const { result: percentResult } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: {
                        facility1: {
                            type: 'orgUnit',
                            aggregation: { categoryDisplayType: 'PERCENTAGE' },
                        },
                    },
                },
            })
        )
        const percentRow1 = percentResult.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(percentRow1, 'facility1_group1').value).toBe(50)
        expect(findCell(percentRow1, 'facility1_group2').value).toBe(50)
    })

    test('a row with 0 matched features: both category columns are null, not NaN/0', () => {
        const layer = facilityLayer([])

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: { facility1: { type: 'orgUnit', aggregation: {} } },
                },
            })
        )
        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'facility1_group1').value).toBe(null)
        expect(findCell(row1, 'facility1_group2').value).toBe(null)
    })

    test('an Event count-only column reflects raw matches.length for a matched row, and null for an unmatched row', () => {
        const layer = {
            id: 'events1',
            name: 'Events',
            combinedLayerKey: 'events1',
            layer: EVENT_LAYER,
            legend: { items: [{ name: 'Event' }] },
            data: [
                feature({ id: 'e1', orgUnitPath: '/country1/ou1' }),
                feature({ id: 'e2', orgUnitPath: '/country1/ou1' }),
            ],
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: { events1: { type: 'orgUnit', aggregation: {} } },
                },
            })
        )
        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        const row2 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou2'
        )
        expect(findCell(row1, 'events1_count').value).toBe(2)
        expect(findCell(row2, 'events1_count').value).toBe(null)
    })

    test("a numeric Event value column ignores 'Not set' features instead of corrupting the aggregation - styleByNumeric (styleByDataItem.js) stamps that literal string on no-data features when 'No data' styling is enabled", () => {
        const layer = {
            id: 'events1',
            name: 'Events',
            combinedLayerKey: 'events1',
            layer: EVENT_LAYER,
            styleDataItem: { id: 'de1', valueType: 'NUMBER' },
            legend: { items: [{ name: 'Low' }, { name: 'High' }] },
            data: [
                feature({ id: 'e1', orgUnitPath: '/country1/ou1', value: 10 }),
                feature({
                    id: 'e2',
                    orgUnitPath: '/country1/ou1',
                    value: 'Not set',
                }),
            ],
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: {
                        events1: {
                            type: 'orgUnit',
                            aggregation: { value: 'SUM' },
                        },
                    },
                },
            })
        )
        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'events1_value').value).toBe(10)
    })

    test('header name for a count-only Facility column', () => {
        const layer = {
            id: 'facility1',
            name: 'My Facilities',
            combinedLayerKey: 'facility1',
            layer: FACILITY_LAYER,
            legend: { items: [{ name: 'Facility' }] },
            data: [],
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: { facility1: { type: 'orgUnit', aggregation: {} } },
                },
            })
        )
        const header = result.current.headers.find(
            (h) => h.dataKey === 'facility1_count'
        )
        expect(header.name).toBe('Count (My Facilities)')
    })

    test('header name for a category column: count mode vs percentage mode, including rounding', () => {
        const layer = facilityLayer([])

        const { result: countResult } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: { facility1: { type: 'orgUnit', aggregation: {} } },
                },
            })
        )
        const countHeader = countResult.current.headers.find(
            (h) => h.dataKey === 'facility1_group1'
        )
        expect(countHeader.name).toBe('Hospital (count) (Facilities)')
        expect(countHeader.roundFn).toBeUndefined()

        const { result: percentResult } = renderHook(() =>
            useCombinedTableData({
                layers: [layer],
                referenceLayer,
                joinConfig: {
                    layers: {
                        facility1: {
                            type: 'orgUnit',
                            aggregation: { categoryDisplayType: 'PERCENTAGE' },
                        },
                    },
                },
            })
        )
        const percentHeader = percentResult.current.headers.find(
            (h) => h.dataKey === 'facility1_group1'
        )
        expect(percentHeader.name).toBe('Hospital (%) (Facilities)')
        expect(percentHeader.roundFn(33.456)).toBe(33.5)
    })
})
