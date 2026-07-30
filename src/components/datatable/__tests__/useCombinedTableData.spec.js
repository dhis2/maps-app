import { renderHook } from '@testing-library/react'
import { EARTH_ENGINE_LAYER, EVENT_LAYER } from '../../../constants/layers.js'
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
                layer: 'event',
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
                        properties: { id: 'e1', rawValue: 7 },
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
                events: { type: 'spatial', aggregation: { rawValue: 'SUM' } },
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
        expect(findCell(row1, 'events_rawValue').value).toBe(7)
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
                layer: 'event',
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
