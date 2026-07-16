import { getPinnedLeftOffsets, getVisibleHeaders } from '../tableColumns.js'

const headers = [
    { name: 'Name', dataKey: 'name' },
    { name: 'Id', dataKey: 'id' },
    { name: 'Value', dataKey: 'rawValue' },
    { name: 'Legend', dataKey: 'legend' },
]

describe('getVisibleHeaders', () => {
    it('returns all headers unchanged when there is no saved config', () => {
        expect(getVisibleHeaders(headers, null)).toEqual(headers)
    })

    it('passes through a null/undefined headers list', () => {
        expect(getVisibleHeaders(null, null)).toBe(null)
    })

    it('treats an explicit null for any config field the same as it being absent', () => {
        const result = getVisibleHeaders(headers, {
            visibleKeys: null,
            orderedKeys: null,
            pinnedKeys: null,
        })
        expect(result).toEqual(headers)
    })

    it('hides every column when visibleKeys is an explicit empty array', () => {
        expect(getVisibleHeaders(headers, { visibleKeys: [] })).toEqual([])
    })

    it('filters out headers not in visibleKeys', () => {
        const result = getVisibleHeaders(headers, {
            visibleKeys: ['name', 'legend'],
        })
        expect(result.map((h) => h.dataKey)).toEqual(['name', 'legend'])
    })

    it('keeps a header visible when visibleKeys is not set at all', () => {
        const result = getVisibleHeaders(headers, { pinnedKeys: ['name'] })
        expect(result.map((h) => h.dataKey)).toEqual([
            'name',
            'id',
            'rawValue',
            'legend',
        ])
    })

    it('reorders headers according to orderedKeys', () => {
        const result = getVisibleHeaders(headers, {
            orderedKeys: ['legend', 'name', 'id', 'rawValue'],
        })
        expect(result.map((h) => h.dataKey)).toEqual([
            'legend',
            'name',
            'id',
            'rawValue',
        ])
    })

    it('appends headers missing from orderedKeys at the end, preserving their relative order', () => {
        const result = getVisibleHeaders(headers, {
            orderedKeys: ['rawValue'],
        })
        expect(result.map((h) => h.dataKey)).toEqual([
            'rawValue',
            'name',
            'id',
            'legend',
        ])
    })

    it('drops a stale dataKey in orderedKeys/visibleKeys that no longer matches any header', () => {
        const result = getVisibleHeaders(headers, {
            orderedKeys: ['deletedColumn', 'legend', 'name', 'id', 'rawValue'],
            visibleKeys: ['deletedColumn', 'name', 'legend'],
        })
        expect(result.map((h) => h.dataKey)).toEqual(['legend', 'name'])
    })

    it('moves pinned columns to the front, regardless of orderedKeys', () => {
        const result = getVisibleHeaders(headers, {
            orderedKeys: ['name', 'id', 'rawValue', 'legend'],
            pinnedKeys: ['rawValue'],
        })
        expect(result.map((h) => h.dataKey)).toEqual([
            'rawValue',
            'name',
            'id',
            'legend',
        ])
    })

    it('preserves relative order among multiple pinned columns', () => {
        const result = getVisibleHeaders(headers, {
            pinnedKeys: ['legend', 'id'],
        })
        expect(result.map((h) => h.dataKey)).toEqual([
            'id',
            'legend',
            'name',
            'rawValue',
        ])
    })

    it('combines ordering, visibility, and pinning together', () => {
        const result = getVisibleHeaders(headers, {
            orderedKeys: ['legend', 'name', 'id', 'rawValue'],
            visibleKeys: ['legend', 'name', 'rawValue'],
            pinnedKeys: ['rawValue'],
        })
        expect(result.map((h) => h.dataKey)).toEqual([
            'rawValue',
            'legend',
            'name',
        ])
    })
})

describe('getPinnedLeftOffsets', () => {
    const visibleHeaders = [
        { name: 'Value', dataKey: 'rawValue' },
        { name: 'Name', dataKey: 'name' },
        { name: 'Id', dataKey: 'id' },
    ]
    const columnWidths = [100, 150, 80]

    it('returns no offsets when there are no pinned keys', () => {
        expect(getPinnedLeftOffsets(visibleHeaders, [], columnWidths)).toEqual(
            {}
        )
    })

    it('returns no offsets when column widths have not been measured yet', () => {
        expect(getPinnedLeftOffsets(visibleHeaders, ['rawValue'], [])).toEqual(
            {}
        )
    })

    it('starts the first pinned column after the checkbox column', () => {
        const offsets = getPinnedLeftOffsets(
            visibleHeaders,
            ['rawValue'],
            columnWidths
        )
        expect(offsets).toEqual({ rawValue: 76 })
    })

    it('accumulates offsets for consecutive pinned columns', () => {
        const offsets = getPinnedLeftOffsets(
            visibleHeaders,
            ['rawValue', 'name'],
            columnWidths
        )
        expect(offsets).toEqual({ rawValue: 76, name: 176 })
    })

    it('only offsets columns that are actually pinned', () => {
        const offsets = getPinnedLeftOffsets(
            visibleHeaders,
            ['id'],
            columnWidths
        )
        expect(offsets).toEqual({ id: 76 })
    })

    it('does not let an unpinned column contribute width when pinned columns are not contiguous', () => {
        // Not a realistic input in practice (getVisibleHeaders always
        // makes pinned columns contiguous first), but the function itself
        // shouldn't silently corrupt offsets if that invariant is broken.
        const offsets = getPinnedLeftOffsets(
            visibleHeaders,
            ['rawValue', 'id'],
            columnWidths
        )
        expect(offsets).toEqual({ rawValue: 76, id: 176 })
    })
})
