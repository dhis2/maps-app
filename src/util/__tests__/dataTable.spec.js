import {
    EARTH_ENGINE_LAYER,
    THEMATIC_LAYER,
    EXTERNAL_LAYER,
} from '../../constants/layers.js'
import {
    buildFeatureIndex,
    getCombinedValueDataKeys,
    getEligibleDataTableLayers,
    getLayerSelectedIds,
    getNextSorting,
    getPanelHeights,
    getRowClickAction,
    getRowId,
    getUnionBounds,
    hasActiveDataTableFilters,
    isDataTableOpen,
    isFilterable,
    mergeCrossLayerIds,
    shouldClearFeatureHighlight,
} from '../dataTable.js'

describe('getCombinedValueDataKeys', () => {
    test('returns a single generic rawValue column for any non-Earth-Engine layer', () => {
        expect(getCombinedValueDataKeys({ layer: THEMATIC_LAYER })).toEqual([
            { dataKey: 'rawValue', name: null },
        ])
    })

    test('returns one column per aggregation stat when aggregationType is an array', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: ['mean', 'max'],
                legend: { title: 'NDVI' },
            })
        ).toEqual([
            { dataKey: 'mean', name: 'Mean Ndvi' },
            { dataKey: 'max', name: 'Max Ndvi' },
        ])
    })

    test('returns one column per legend class when aggregationType is classified', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: 'percentage',
                legend: {
                    items: [
                        { value: 1, name: 'Forest' },
                        { value: 2, name: 'Water' },
                    ],
                },
            })
        ).toEqual([
            { dataKey: '1', name: 'Forest' },
            { dataKey: '2', name: 'Water' },
        ])
    })

    test('returns no columns for an Earth Engine layer with neither shape configured yet', () => {
        expect(
            getCombinedValueDataKeys({
                layer: EARTH_ENGINE_LAYER,
                aggregationType: null,
                legend: {},
            })
        ).toEqual([])
    })
})

describe('shouldClearFeatureHighlight', () => {
    test('clears when leaving to no element (cursor exits the window)', () => {
        expect(shouldClearFeatureHighlight({ relatedTarget: null })).toBe(true)
    })

    test('does not clear when hovering to an adjacent row cell (TD)', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'TD' } })
        ).toBe(false)
    })

    test('clears when leaving to a non-TD element', () => {
        expect(
            shouldClearFeatureHighlight({ relatedTarget: { tagName: 'DIV' } })
        ).toBe(true)
    })
})

describe('getRowId', () => {
    test('returns the id-keyed cell value when present', () => {
        const row = [
            { dataKey: 'name', value: 'Foo' },
            { dataKey: 'id', value: 'abc123' },
        ]
        expect(getRowId(row)).toBe('abc123')
    })

    test('falls back to the first cell itemId when there is no id cell', () => {
        const row = [{ dataKey: 'name', value: 'Foo', itemId: 'xyz789' }]
        expect(getRowId(row)).toBe('xyz789')
    })
})

describe('getRowClickAction', () => {
    const rows = [
        [{ dataKey: 'id', value: 'a', itemId: 'a' }],
        [{ dataKey: 'id', value: 'b', itemId: 'b' }],
        [{ dataKey: 'id', value: 'c', itemId: 'c' }],
        [{ dataKey: 'id', value: 'd', itemId: 'd' }],
    ]

    test('plain click is ignored', () => {
        expect(
            getRowClickAction(
                {},
                { id: 'b', rowIndex: 1, rows, lastClickedRowIndex: null }
            )
        ).toBeNull()
    })

    test('ctrl-click toggles just that row', () => {
        expect(
            getRowClickAction(
                { ctrlKey: true },
                { id: 'b', rowIndex: 1, rows, lastClickedRowIndex: null }
            )
        ).toEqual({ type: 'toggle', id: 'b' })
    })

    test('shift-click with no prior anchor falls back to a single-row toggle', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'c', rowIndex: 2, rows, lastClickedRowIndex: null }
            )
        ).toEqual({ type: 'toggle', id: 'c' })
    })

    test('shift-click with a prior anchor selects the range between them', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'd', rowIndex: 3, rows, lastClickedRowIndex: 1 }
            )
        ).toEqual({ type: 'range', ids: ['b', 'c', 'd'] })
    })

    test('shift-click range works regardless of anchor/target order', () => {
        expect(
            getRowClickAction(
                { shiftKey: true },
                { id: 'a', rowIndex: 0, rows, lastClickedRowIndex: 2 }
            )
        ).toEqual({ type: 'range', ids: ['a', 'b', 'c'] })
    })
})

describe('getNextSorting', () => {
    test('clicking an unsorted column starts at ascending', () => {
        expect(
            getNextSorting('name', { sortField: null, sortDirection: 'asc' })
        ).toEqual({ sortField: 'name', sortDirection: 'asc' })
    })

    test('clicking the ascending-sorted column moves to descending', () => {
        expect(
            getNextSorting('name', { sortField: 'name', sortDirection: 'asc' })
        ).toEqual({ sortField: 'name', sortDirection: 'desc' })
    })

    test('clicking the descending-sorted column clears back to natural order', () => {
        expect(
            getNextSorting('name', { sortField: 'name', sortDirection: 'desc' })
        ).toEqual({ sortField: null, sortDirection: 'asc' })
    })

    test('clicking a different column restarts the cycle at ascending', () => {
        expect(
            getNextSorting('type', { sortField: 'name', sortDirection: 'desc' })
        ).toEqual({ sortField: 'type', sortDirection: 'asc' })
    })
})

describe('isFilterable', () => {
    test('allows numeric and string columns', () => {
        expect(isFilterable('rawValue', 'number')).toBe(true)
        expect(isFilterable('name', 'string')).toBe(true)
    })

    test('excludes columns with no type (no known filter UI for them)', () => {
        expect(isFilterable('someKey', undefined)).toBe(false)
    })
})

describe('hasActiveDataTableFilters', () => {
    const empty = {
        dataFilters: {},
        globalSearch: '',
        selectionFilter: [],
        showOnlyFeaturesInView: false,
    }

    test('is false when nothing is filtered', () => {
        expect(hasActiveDataTableFilters(empty)).toBe(false)
    })

    test('is true when a column filter is set', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                dataFilters: { name: 'foo' },
            })
        ).toBe(true)
    })

    test('is true for a non-blank global search, trimmed', () => {
        expect(
            hasActiveDataTableFilters({ ...empty, globalSearch: '  ' })
        ).toBe(false)
        expect(
            hasActiveDataTableFilters({ ...empty, globalSearch: ' foo ' })
        ).toBe(true)
    })

    test('is true when a selection filter is applied', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                selectionFilter: ['selected'],
            })
        ).toBe(true)
    })

    test('is true when showOnlyFeaturesInView is on, even with nothing else set', () => {
        expect(
            hasActiveDataTableFilters({
                ...empty,
                showOnlyFeaturesInView: true,
            })
        ).toBe(true)
    })
})

describe('buildFeatureIndex', () => {
    test('indexes features by properties.id when present', () => {
        const data = [{ properties: { id: 'a' } }, { properties: { id: 'b' } }]
        const index = buildFeatureIndex(data)
        expect(index.get('a')).toBe(data[0])
        expect(index.get('b')).toBe(data[1])
    })

    test('falls back to the feature’s own top-level id', () => {
        const feature = { id: 'a', properties: {} }
        expect(buildFeatureIndex([feature]).get('a')).toBe(feature)
    })

    test('skips features with no id anywhere', () => {
        const index = buildFeatureIndex([{ properties: {} }])
        expect(index.size).toBe(0)
    })

    test('returns an empty index for missing/empty data', () => {
        expect(buildFeatureIndex(undefined).size).toBe(0)
        expect(buildFeatureIndex([]).size).toBe(0)
    })
})

describe('getEligibleDataTableLayers', () => {
    test('includes data-table-capable layer types that have finished loading', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: true, data: [{}] },
            {
                id: 'b',
                layer: THEMATIC_LAYER,
                isLoaded: true,
                data: [{}, {}],
            },
        ]
        expect(getEligibleDataTableLayers(mapViews).map((l) => l.id)).toEqual([
            'a',
            'b',
        ])
    })

    test('excludes layer types with no data table support', () => {
        const mapViews = [
            { id: 'a', layer: EXTERNAL_LAYER, isLoaded: true, data: [{}] },
        ]
        expect(getEligibleDataTableLayers(mapViews)).toEqual([])
    })

    test('excludes a data-table-capable layer that has not finished loading yet', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: false, data: [{}] },
        ]
        expect(getEligibleDataTableLayers(mapViews)).toEqual([])
    })

    test('includes a loaded, data-table-capable layer with no valid data - the caller shows an explanatory message instead of hiding it', () => {
        const mapViews = [
            { id: 'a', layer: THEMATIC_LAYER, isLoaded: true, data: [] },
        ]
        expect(getEligibleDataTableLayers(mapViews).map((l) => l.id)).toEqual([
            'a',
        ])
    })
})

describe('isDataTableOpen', () => {
    test('is open when at least one tab is open', () => {
        expect(
            isDataTableOpen({ openIds: ['layer1'], combinedView: false })
        ).toBe(true)
    })

    test('is open when Combined is active, even with no open tabs', () => {
        expect(isDataTableOpen({ openIds: [], combinedView: true })).toBe(true)
    })

    test('is closed when there are no open tabs and Combined is not active', () => {
        expect(isDataTableOpen({ openIds: [], combinedView: false })).toBe(
            false
        )
    })
})

describe('getLayerSelectedIds', () => {
    test('returns an empty array when there is no selection', () => {
        expect(getLayerSelectedIds(null, 'layer1')).toEqual([])
    })

    test("returns this layer's own selected ids when selection.layerId matches", () => {
        expect(
            getLayerSelectedIds(
                { layerId: 'layer1', ids: ['a', 'b'] },
                'layer1'
            )
        ).toEqual(['a', 'b'])
    })

    test('returns crossLayerIds ids when selection.layerId belongs to no single layer (Combined)', () => {
        expect(
            getLayerSelectedIds(
                { layerId: null, ids: [], crossLayerIds: { layer1: ['x'] } },
                'layer1'
            )
        ).toEqual(['x'])
    })

    test('merges crossLayerIds with a same-layer selection, deduping', () => {
        expect(
            getLayerSelectedIds(
                {
                    layerId: 'layer1',
                    ids: ['a'],
                    crossLayerIds: { layer1: ['a', 'b'] },
                },
                'layer1'
            )
        ).toEqual(['a', 'b'])
    })

    test('ignores a selection/crossLayerIds entry belonging to another layer', () => {
        expect(
            getLayerSelectedIds(
                {
                    layerId: 'other-layer',
                    ids: ['a'],
                    crossLayerIds: { 'other-layer': ['a'] },
                },
                'layer1'
            )
        ).toEqual([])
    })
})

describe('mergeCrossLayerIds', () => {
    const rowFeatureIds = new Map([
        ['ou1', { layerA: ['a1'], layerB: ['b1'] }],
        ['ou2', { layerA: ['a2'] }],
    ])

    test('unions per-layer id sets across every named row', () => {
        expect(mergeCrossLayerIds(['ou1', 'ou2'], rowFeatureIds)).toEqual({
            layerA: ['a1', 'a2'],
            layerB: ['b1'],
        })
    })

    test('dedupes ids repeated across rows for the same layer', () => {
        const withOverlap = new Map([
            ['ou1', { layerA: ['a1'] }],
            ['ou2', { layerA: ['a1', 'a2'] }],
        ])
        expect(mergeCrossLayerIds(['ou1', 'ou2'], withOverlap)).toEqual({
            layerA: ['a1', 'a2'],
        })
    })

    test('skips row keys with no entry', () => {
        expect(mergeCrossLayerIds(['ou1', 'missing'], rowFeatureIds)).toEqual({
            layerA: ['a1'],
            layerB: ['b1'],
        })
    })

    test('returns an empty object for no rows', () => {
        expect(mergeCrossLayerIds([], rowFeatureIds)).toEqual({})
    })
})

describe('getUnionBounds', () => {
    const point = (id, coordinates) => ({
        type: 'Feature',
        properties: { id },
        geometry: { type: 'Point', coordinates },
    })

    const layers = [
        {
            id: 'layerA',
            data: [point('a1', [0, 0]), point('a2', [10, 10])],
        },
        { id: 'layerB', data: [point('b1', [5, -5])] },
    ]

    test('computes the union bbox across every named feature on every layer', () => {
        expect(
            getUnionBounds(layers, { layerA: ['a1', 'a2'], layerB: ['b1'] })
        ).toEqual([
            [0, -5],
            [10, 10],
        ])
    })

    test('ignores layers/ids not named in idsByLayerId', () => {
        expect(getUnionBounds(layers, { layerA: ['a1'] })).toEqual([
            [0, 0],
            [0, 0],
        ])
    })

    test('returns null when nothing matches', () => {
        expect(getUnionBounds(layers, {})).toBeNull()
    })

    test('skips ids that have no matching feature or geometry', () => {
        expect(getUnionBounds(layers, { layerA: ['missing'] })).toBeNull()
    })
})

describe('getPanelHeights', () => {
    test('clamps the table height to the window, minus header/toolbar', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 1000,
            isCollapsed: false,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result).toEqual({
            maxHeight: 700,
            collapsedHeight: 32,
            displayHeight: 700,
        })
    })

    test('uses the saved height as-is when it already fits', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 300,
            isCollapsed: false,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result.displayHeight).toBe(300)
    })

    test('collapses to just the controls height, regardless of the saved height', () => {
        const result = getPanelHeights({
            windowHeight: 800,
            dataTableHeight: 300,
            isCollapsed: true,
            headerHeight: 50,
            toolbarHeight: 50,
            controlsHeight: 32,
        })
        expect(result.displayHeight).toBe(32)
    })
})
