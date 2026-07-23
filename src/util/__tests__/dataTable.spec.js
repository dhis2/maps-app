import {
    buildFeatureIndex,
    getNextSorting,
    getPanelHeights,
    getRowClickAction,
    getRowId,
    hasActiveDataTableFilters,
    isFilterable,
    shouldClearFeatureHighlight,
} from '../dataTable.js'

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
