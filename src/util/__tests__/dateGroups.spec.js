import {
    TYPE_DATE,
    TYPE_DATETIME,
    TYPE_TIME,
} from '../../constants/dataTable.js'
import {
    parseDateGroupKey,
    buildDateGroupTree,
    formatNodeLabel,
} from '../dateGroups.js'

describe('parseDateGroupKey', () => {
    it('parses a space-delimited datetime, preserving the space as the hour prefix delimiter', () => {
        expect(
            parseDateGroupKey('2023-05-15 14:23:00.0', TYPE_DATETIME)
        ).toEqual({
            year: '2023',
            month: '2023-05',
            day: '2023-05-15',
            hour: '2023-05-15 14',
        })
    })

    it('parses a T-delimited datetime, preserving the T as the hour prefix delimiter', () => {
        expect(parseDateGroupKey('2023-05-15T14:23:00', TYPE_DATETIME)).toEqual(
            {
                year: '2023',
                month: '2023-05',
                day: '2023-05-15',
                hour: '2023-05-15T14',
            }
        )
    })

    it('returns a null hour when the raw value has no time component', () => {
        expect(parseDateGroupKey('2023-05-15', TYPE_DATETIME)).toEqual({
            year: '2023',
            month: '2023-05',
            day: '2023-05-15',
            hour: null,
        })
    })

    it('never includes an hour prefix for TYPE_DATE granularity, even if the raw value has a time part', () => {
        expect(parseDateGroupKey('2023-05-15 14:23:00.0', TYPE_DATE)).toEqual({
            year: '2023',
            month: '2023-05',
            day: '2023-05-15',
            hour: null,
        })
    })

    it('parses a bare hour for TYPE_TIME granularity', () => {
        expect(parseDateGroupKey('14:23:00', TYPE_TIME)).toEqual({ hour: '14' })
    })

    it('returns null for unparseable values', () => {
        expect(parseDateGroupKey('not-a-date', TYPE_DATETIME)).toBeNull()
        expect(parseDateGroupKey('not-a-time', TYPE_TIME)).toBeNull()
    })
})

describe('buildDateGroupTree', () => {
    it('TYPE_DATE stops the Y/M/D hierarchy at the day level: its children are the real values, formatted like the column, not hour buckets', () => {
        const values = ['2023-05-15 09:00:00.0', '2023-05-15 14:00:00.0']
        const tree = buildDateGroupTree(values, TYPE_DATE)
        expect(tree).toHaveLength(1) // one year
        const [year] = tree
        expect(year.children).toHaveLength(1) // one month
        const [month] = year.children
        expect(month.children).toHaveLength(1) // one day
        const [day] = month.children
        expect(day.children.every((c) => c.level === 'value')).toBe(true)
        expect(day.children.map((c) => c.label)).toEqual([
            '2023-05-15',
            '2023-05-15',
        ])
    })

    it('TYPE_DATETIME builds the full Year -> Month -> Day -> Hour -> value tree, and real values are formatted like the column', () => {
        const values = [
            '2023-05-15 09:00:00.0',
            '2023-05-15 09:30:00.0',
            '2023-05-15 14:00:00.0',
            '2023-06-01 00:00:00.0',
        ]
        const tree = buildDateGroupTree(values, TYPE_DATETIME)
        expect(tree).toHaveLength(1)
        const [year] = tree
        expect(year.key).toBe('2023')
        expect(year.children.map((m) => m.key)).toEqual(['2023-05', '2023-06'])
        const may = year.children[0]
        expect(may.children).toHaveLength(1) // one day (15th)
        const day15 = may.children[0]
        expect(day15.children.map((h) => h.key)).toEqual([
            '2023-05-15 09',
            '2023-05-15 14',
        ])
        const hour09 = day15.children[0]
        expect(hour09.children.map((v) => v.label)).toEqual([
            '2023-05-15 09:00',
            '2023-05-15 09:30',
        ])
    })

    it('TYPE_TIME builds a flat Hour -> value tree, real values formatted verbatim (no date to format)', () => {
        const tree = buildDateGroupTree(
            ['09:00:00', '14:00:00', '09:30:00'],
            TYPE_TIME
        )
        expect(tree.map((h) => h.key)).toEqual(['09', '14'])
        expect(tree[0].children.map((v) => v.label)).toEqual([
            '09:00:00',
            '09:30:00',
        ])
        expect(tree[1].children.map((v) => v.label)).toEqual(['14:00:00'])
    })

    it("preserves the input order at every level, rather than forcing ascending - callers already order values to match the column's current sort direction", () => {
        const ascendingValues = ['2023-01-01', '2023-05-15', '2024-01-01']
        const ascending = buildDateGroupTree(ascendingValues, TYPE_DATE)
        expect(ascending.map((y) => y.key)).toEqual(['2023', '2024'])
        expect(ascending[0].children.map((m) => m.key)).toEqual([
            '2023-01',
            '2023-05',
        ])

        const descendingValues = ['2024-01-01', '2023-05-15', '2023-01-01']
        const descending = buildDateGroupTree(descendingValues, TYPE_DATE)
        expect(descending.map((y) => y.key)).toEqual(['2024', '2023'])
        expect(descending[1].children.map((m) => m.key)).toEqual([
            '2023-05',
            '2023-01',
        ])
    })

    it('buckets unparseable values as root-level leaf nodes instead of dropping them', () => {
        const tree = buildDateGroupTree(['2023-05-15', 'garbage'], TYPE_DATE)
        const leaf = tree.find((n) => n.level === 'leaf')
        expect(leaf).toEqual({
            key: 'garbage',
            level: 'leaf',
            label: 'garbage',
            prefix: 'garbage',
            children: [],
        })
    })
})

describe('formatNodeLabel', () => {
    it('formats a year node verbatim', () => {
        expect(formatNodeLabel({ level: 'year', key: '2023' }, 'en')).toBe(
            '2023'
        )
    })

    it('formats a month node as just a localized month name (no year - the ancestor year node already shows it)', () => {
        expect(formatNodeLabel({ level: 'month', key: '2023-05' }, 'en')).toBe(
            'May'
        )
    })

    it('formats a day node as the day number first, followed by the full weekday name', () => {
        expect(formatNodeLabel({ level: 'day', key: '2023-05-15' }, 'en')).toBe(
            '15 Monday'
        )
    })

    it('zero-pads a single-digit day number', () => {
        expect(formatNodeLabel({ level: 'day', key: '2023-05-01' }, 'en')).toBe(
            '01 Monday'
        )
    })

    it('formats a value node using its precomputed, column-matching label', () => {
        expect(
            formatNodeLabel(
                { level: 'value', key: 'x', label: '2023-05-15 09:00' },
                'en'
            )
        ).toBe('2023-05-15 09:00')
    })

    it('formats an hour node (date-scoped or bare) as "HH:00"', () => {
        expect(
            formatNodeLabel({ level: 'hour', key: '2023-05-15 09' }, 'en')
        ).toBe('09:00')
        expect(formatNodeLabel({ level: 'hour', key: '09' }, 'en')).toBe(
            '09:00'
        )
    })

    it('falls back to the raw key for a leaf node', () => {
        expect(formatNodeLabel({ level: 'leaf', key: 'garbage' }, 'en')).toBe(
            'garbage'
        )
    })
})
