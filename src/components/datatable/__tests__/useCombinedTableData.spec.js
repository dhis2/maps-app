import { renderHook } from '@testing-library/react'
import useOrgUnitAncestorNames from '../../../hooks/useOrgUnitAncestorNames.js'
import { useCombinedTableData } from '../useCombinedTableData.js'

jest.mock('../../../hooks/useOrgUnitAncestorNames.js', () => ({
    __esModule: true,
    default: jest.fn(),
}))

beforeEach(() => {
    useOrgUnitAncestorNames.mockReturnValue({
        idToName: new Map(),
        loading: false,
    })
})

const feature = (props) => ({ properties: props })

const findCell = (row, dataKey) => row.find((c) => c.dataKey === dataKey)

describe('useCombinedTableData - org unit join', () => {
    // Thematic/org unit/facility layers - where the feature IS the org unit
    // - never get an orgUnitId property: their data is built by toGeoJson()
    // in util/map.js, which only sets id/orgUnitPath/orgUnitOwn. Only
    // event/tracked-entity layers (via attachOrgUnitPaths in
    // util/orgUnits.js, referencing an org unit the feature isn't itself)
    // get a real orgUnitId. This is the shape that actually appears in
    // production for the two most common layer types in this join mode -
    // using orgUnitId in the fixture here would mask exactly the bug this
    // guards against.
    test('joins two org-unit-identity layers (no orgUnitId property) by their own id, filling blanks for unmatched org units', () => {
        useOrgUnitAncestorNames.mockReturnValue({
            idToName: new Map([
                ['ou1', 'Ou One'],
                ['ou2', 'Ou Two'],
            ]),
            loading: false,
        })

        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        level: 2,
                        rawValue: 10,
                        legend: 'Low',
                    }),
                ],
            },
            {
                id: 'layerB',
                name: 'Layer B',
                data: [
                    feature({
                        id: 'ou2',
                        orgUnitPath: '/country1/ou2',
                        level: 2,
                        rawValue: 20,
                        legend: 'High',
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'orgUnit',
            layerIds: ['layerA', 'layerB'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'level',
            'layerA_rawValue',
            'layerA_legend',
            'layerB_rawValue',
            'layerB_legend',
        ])
        expect(result.current.rows).toHaveLength(2)

        const row1 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou1'
        )
        expect(findCell(row1, 'name').value).toBe('Ou One')
        expect(findCell(row1, 'layerA_rawValue').value).toBe(10)
        expect(findCell(row1, 'layerB_rawValue').value).toBe(null)

        const row2 = result.current.rows.find(
            (r) => findCell(r, 'id').value === 'ou2'
        )
        expect(findCell(row2, 'name').value).toBe('Ou Two')
        expect(findCell(row2, 'layerA_rawValue').value).toBe(null)
        expect(findCell(row2, 'layerB_rawValue').value).toBe(20)
    })

    test('prefers orgUnitId over id when both are present (event/tracked-entity layer shape)', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    // The event's own id ('evt1') is not an org unit -
                    // orgUnitId is the registering org unit and must win.
                    feature({
                        id: 'evt1',
                        orgUnitId: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'orgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rows).toHaveLength(1)
        expect(findCell(result.current.rows[0], 'id').value).toBe('ou1')
    })

    test('falls back to the raw org unit id when its name has not resolved yet', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/ou1',
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'orgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(findCell(result.current.rows[0], 'name').value).toBe('ou1')
    })

    test('excludes features with hasAdditionalGeometry set', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        rawValue: 10,
                        hasAdditionalGeometry: true,
                    }),
                    feature({ id: 'ou2', rawValue: 20 }),
                ],
            },
        ]
        const joinConfig = {
            level: 'orgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rows).toHaveLength(1)
        expect(findCell(result.current.rows[0], 'id').value).toBe('ou2')
    })

    test('rowFeatureIds includes every feature sharing an org unit, not just the last one displayed', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({ id: 'evt1', orgUnitId: 'ou1', rawValue: 10 }),
                    feature({ id: 'evt2', orgUnitId: 'ou1', rawValue: 20 }),
                ],
            },
        ]
        const joinConfig = {
            level: 'orgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rowFeatureIds.get('ou1')).toEqual({
            layerA: ['evt1', 'evt2'],
        })
    })
})

describe('useCombinedTableData - parent org unit grouping', () => {
    test('groups rows by parent org unit and averages numeric values', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/parent1/ou1',
                        rawValue: 10,
                    }),
                    feature({
                        id: 'ou2',
                        orgUnitPath: '/country1/parent1/ou2',
                        rawValue: 20,
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'parentOrgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        useOrgUnitAncestorNames.mockReturnValue({
            idToName: new Map([['parent1', 'Parent One']]),
            loading: false,
        })

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rows).toHaveLength(1)
        const row = result.current.rows[0]
        expect(findCell(row, 'id').value).toBe('parent1')
        expect(findCell(row, 'name').value).toBe('Parent One')
        expect(findCell(row, 'layerA_rawValue').value).toBe(15)
        expect(findCell(row, 'layerA_legend').value).toBe(null)
    })

    test('groups org units with no parent path under a single "No parent" row', () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/ou1',
                        rawValue: 10,
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'parentOrgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rows).toHaveLength(1)
        expect(findCell(result.current.rows[0], 'id').value).toBe(null)
        expect(findCell(result.current.rows[0], 'name').value).toBe('No parent')
    })

    test("rowFeatureIds unions every member org unit's feature ids under the parent group", () => {
        const layers = [
            {
                id: 'layerA',
                name: 'Layer A',
                data: [
                    feature({
                        id: 'ou1',
                        orgUnitPath: '/country1/parent1/ou1',
                        rawValue: 10,
                    }),
                    feature({
                        id: 'ou2',
                        orgUnitPath: '/country1/parent1/ou2',
                        rawValue: 20,
                    }),
                ],
            },
        ]
        const joinConfig = {
            level: 'parentOrgUnit',
            layerIds: ['layerA'],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers, joinConfig })
        )

        expect(result.current.rowFeatureIds.get('parent1')).toEqual({
            layerA: ['ou1', 'ou2'],
        })
    })
})

describe('useCombinedTableData - spatial join', () => {
    const pointLayer = {
        id: 'points',
        name: 'Points',
        data: [
            {
                type: 'Feature',
                properties: { id: 'p1', name: 'Point One' },
                geometry: { type: 'Point', coordinates: [1, 1] },
            },
        ],
    }
    const polygonLayer = {
        id: 'polygons',
        name: 'Polygons',
        data: [
            {
                type: 'Feature',
                properties: { id: 'poly1', rawValue: 42, legend: 'High' },
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

    test("falls back to the feature's own name when it has no org unit path", () => {
        const joinConfig = {
            level: 'spatial',
            layerIds: [],
            pointLayerId: 'points',
            polygonLayerId: 'polygons',
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [pointLayer, polygonLayer],
                joinConfig,
            })
        )

        expect(result.current.headers.map((h) => h.dataKey)).toEqual([
            'id',
            'name',
            'polygons_rawValue',
            'polygons_legend',
        ])
        expect(result.current.rows).toEqual([
            [
                { dataKey: 'id', value: 'p1', align: 'left' },
                { dataKey: 'name', value: 'Point One', align: 'left' },
                {
                    dataKey: 'polygons_rawValue',
                    value: 42,
                    align: 'right',
                },
                { dataKey: 'polygons_legend', value: 'High', align: 'left' },
            ],
        ])
        expect(result.current.spatialWarning).toBe(false)
        expect(result.current.rowFeatureIds.get('p1')).toEqual({
            points: ['p1'],
            polygons: ['poly1'],
        })
    })

    test('resolves the org unit name when the point feature has an org unit path', () => {
        useOrgUnitAncestorNames.mockReturnValue({
            idToName: new Map([['p1', 'Resolved Point Name']]),
            loading: false,
        })

        const pointLayerWithOrgUnit = {
            ...pointLayer,
            data: [
                {
                    type: 'Feature',
                    properties: {
                        id: 'p1',
                        name: 'Point One',
                        orgUnitPath: '/country1/p1',
                    },
                    geometry: { type: 'Point', coordinates: [1, 1] },
                },
            ],
        }
        const joinConfig = {
            level: 'spatial',
            layerIds: [],
            pointLayerId: 'points',
            polygonLayerId: 'polygons',
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [pointLayerWithOrgUnit, polygonLayer],
                joinConfig,
            })
        )

        expect(findCell(result.current.rows[0], 'name').value).toBe(
            'Resolved Point Name'
        )
    })

    test('returns an empty result when the point or polygon layer is not found', () => {
        const joinConfig = {
            level: 'spatial',
            layerIds: [],
            pointLayerId: 'points',
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers: [pointLayer], joinConfig })
        )

        expect(result.current).toEqual({
            headers: [],
            rows: [],
            rowFeatureIds: new Map(),
            spatialWarning: false,
        })
    })

    test('sets spatialWarning when either layer exceeds the large-feature threshold', () => {
        const bigPointLayer = {
            ...pointLayer,
            data: Array.from({ length: 10001 }, (_, i) => ({
                type: 'Feature',
                properties: { id: `p${i}` },
                geometry: { type: 'Point', coordinates: [1, 1] },
            })),
        }
        const joinConfig = {
            level: 'spatial',
            layerIds: [],
            pointLayerId: 'points',
            polygonLayerId: 'polygons',
        }

        const { result } = renderHook(() =>
            useCombinedTableData({
                layers: [bigPointLayer, polygonLayer],
                joinConfig,
            })
        )

        expect(result.current.spatialWarning).toBe(true)
    })
})

describe('useCombinedTableData - empty input', () => {
    test('returns an empty result when there are no layers', () => {
        const joinConfig = {
            level: 'orgUnit',
            layerIds: [],
            pointLayerId: null,
            polygonLayerId: null,
        }

        const { result } = renderHook(() =>
            useCombinedTableData({ layers: [], joinConfig })
        )

        expect(result.current).toEqual({
            headers: [],
            rows: [],
            rowFeatureIds: new Map(),
            spatialWarning: false,
        })
    })
})
