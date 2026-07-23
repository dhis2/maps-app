import {
    getNextSorting,
    getRowClickAction,
    getRowId,
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
