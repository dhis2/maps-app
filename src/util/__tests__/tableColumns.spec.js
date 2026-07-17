import {
    getPinnedCellProps,
    getPinnedCount,
    getPinnedLeftOffsets,
    getVisibleHeaders,
    isPinnedGroupEnd,
    reverseVisibleKeys,
    togglePeriodId,
    togglePinnedKey,
    toggleVisibleKey,
} from '../tableColumns.js'

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
        // 'name' sits between the two pinned columns here and must not
        // inflate 'id's offset.
        const offsets = getPinnedLeftOffsets(
            visibleHeaders,
            ['rawValue', 'id'],
            columnWidths
        )
        expect(offsets).toEqual({ rawValue: 76, id: 176 })
    })
})

describe('getPinnedCount', () => {
    it('returns 0 when no headers are pinned', () => {
        expect(getPinnedCount(headers, [])).toBe(0)
    })

    it('counts the leading headers that are pinned', () => {
        expect(getPinnedCount(headers, ['name', 'id'])).toBe(2)
    })

    it('returns the full length when every header is pinned', () => {
        const allKeys = headers.map((h) => h.dataKey)
        expect(getPinnedCount(headers, allKeys)).toBe(headers.length)
    })
})

describe('isPinnedGroupEnd', () => {
    it('is false when nothing is pinned', () => {
        expect(isPinnedGroupEnd(headers[0], 0, headers)).toBe(false)
    })

    it('is false when every header is pinned (no unpinned group to separate from)', () => {
        expect(isPinnedGroupEnd(headers[3], headers.length, headers)).toBe(
            false
        )
    })

    it('is true only for the last pinned header when there is a mix', () => {
        const pinnedCount = 2
        expect(isPinnedGroupEnd(headers[0], pinnedCount, headers)).toBe(false)
        expect(isPinnedGroupEnd(headers[1], pinnedCount, headers)).toBe(true)
        expect(isPinnedGroupEnd(headers[2], pinnedCount, headers)).toBe(false)
    })
})

describe('toggleVisibleKey', () => {
    it('adds a key when checking it', () => {
        expect(toggleVisibleKey(['name'], 'id', true)).toEqual(['name', 'id'])
    })

    it('removes a key when unchecking it', () => {
        expect(toggleVisibleKey(['name', 'id'], 'name', false)).toEqual(['id'])
    })
})

describe('togglePinnedKey', () => {
    it('adds a key when it is not yet pinned', () => {
        expect(togglePinnedKey(['name'], 'id')).toEqual(['name', 'id'])
    })

    it('removes a key when it is already pinned', () => {
        expect(togglePinnedKey(['name', 'id'], 'name')).toEqual(['id'])
    })
})

describe('reverseVisibleKeys', () => {
    it('returns the dataKeys not currently in visibleKeys', () => {
        const result = reverseVisibleKeys(headers, ['name', 'legend'])
        expect(result).toEqual(['id', 'rawValue'])
    })

    it('returns every dataKey when nothing is currently visible', () => {
        const result = reverseVisibleKeys(headers, [])
        expect(result).toEqual(['name', 'id', 'rawValue', 'legend'])
    })
})

describe('getPinnedCellProps', () => {
    const pinnedLeftOffsets = { rawValue: 76, name: 176 }
    const pinnedColumnCount = 2
    const columnWidths = [100, 150, 80, 120]

    it('marks a pinned-in-range column as fixed with its left/width offsets', () => {
        expect(
            getPinnedCellProps('rawValue', 0, {
                pinnedLeftOffsets,
                pinnedColumnCount,
                columnWidths,
            })
        ).toEqual({
            fixed: true,
            left: '76px',
            width: '100px',
            isLastPinned: false,
        })
    })

    it('leaves an unpinned column unfixed with no left/width offsets', () => {
        expect(
            getPinnedCellProps('id', 2, {
                pinnedLeftOffsets,
                pinnedColumnCount,
                columnWidths,
            })
        ).toEqual({
            fixed: false,
            left: undefined,
            width: undefined,
            isLastPinned: false,
        })
    })

    it('flags isLastPinned only at the final pinned index', () => {
        expect(
            getPinnedCellProps('name', 1, {
                pinnedLeftOffsets,
                pinnedColumnCount,
                columnWidths,
            })
        ).toEqual({
            fixed: true,
            left: '176px',
            width: '150px',
            isLastPinned: true,
        })
    })
})

describe('togglePeriodId', () => {
    it('adds a period id when it is not yet added', () => {
        expect(togglePeriodId(['202301'], '202302')).toEqual([
            '202301',
            '202302',
        ])
    })

    it('removes a period id when it is already added', () => {
        expect(togglePeriodId(['202301', '202302'], '202301')).toEqual([
            '202302',
        ])
    })
})
