import {
    SENTINEL_ANY_VALUE,
    SENTINEL_NO_VALUE,
    DATE_GROUPS_GRANULARITY,
} from '../../constants/dataTable.js'
import { filterByGlobalSearch, filterData } from '../filter.js'

describe('filterData', () => {
    it('should return the original data if no filters are provided', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }]
        expect(filterData(data)).toEqual(data)
    })

    it('should filter data based on a string filter', () => {
        const data = [{ a: 'apple' }, { a: 'banana' }, { a: 'cherry' }]
        const filters = { a: 'a' }
        expect(filterData(data, filters)).toEqual([
            { a: 'apple' },
            { a: 'banana' },
        ])
    })

    it('should filter data based on a string filter where the value is considered numeric', () => {
        const data = [{ a: '1' }, { a: '2' }, { a: '3' }]
        const filters = { a: '2' }
        expect(filterData(data, filters)).toEqual([{ a: '2' }])
    })

    it('should filter data based on a numeric filter', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const filters = { a: '>1' }
        expect(filterData(data, filters)).toEqual([{ a: 2 }, { a: 3 }])
    })

    it('should handle complex numeric filters', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }]
        const filters = { a: '>1&<5' }
        expect(filterData(data, filters)).toEqual([
            { a: 2 },
            { a: 3 },
            { a: 4 },
        ])
    })

    it('should filter data using >= operator', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const filters = { a: '>=2' }
        expect(filterData(data, filters)).toEqual([{ a: 2 }, { a: 3 }])
    })

    it('should filter data using <= operator', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const filters = { a: '<=2' }
        expect(filterData(data, filters)).toEqual([{ a: 1 }, { a: 2 }])
    })

    it('should handle complex numeric filters with >= and <=', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }]
        const filters = { a: '>=2&<=4' }
        expect(filterData(data, filters)).toEqual([
            { a: 2 },
            { a: 3 },
            { a: 4 },
        ])
    })

    it('should handle multiple string filters', () => {
        const data = [
            { a: 'apple', b: 'cow' },
            { a: 'banana', b: 'horse' },
            { a: 'cherry', b: 'dog' },
        ]
        const filters = { a: 'a', b: 'r' }
        expect(filterData(data, filters)).toEqual([{ a: 'banana', b: 'horse' }])
    })

    it('should OR-match an array filter against the raw stored value', () => {
        const data = [{ a: 'High' }, { a: 'Medium' }, { a: 'Low' }]
        const filters = { a: ['High', 'Low'] }
        expect(filterData(data, filters)).toEqual([{ a: 'High' }, { a: 'Low' }])
    })

    it('should not filter any rows when the array filter is empty', () => {
        const data = [{ a: 'High' }, { a: 'Low' }]
        const filters = { a: [] }
        expect(filterData(data, filters)).toEqual([{ a: 'High' }, { a: 'Low' }])
    })

    it('should match array filters against non-string values by exact string coercion', () => {
        const data = [{ a: 1 }, { a: 2 }, { a: 3 }]
        const filters = { a: ['1', '3'] }
        expect(filterData(data, filters)).toEqual([{ a: 1 }, { a: 3 }])
    })

    it('should combine an array filter on one field with a string filter on another', () => {
        const data = [
            { a: 'High', b: 'cow' },
            { a: 'High', b: 'horse' },
            { a: 'Low', b: 'horse' },
        ]
        const filters = { a: ['High'], b: 'horse' }
        expect(filterData(data, filters)).toEqual([{ a: 'High', b: 'horse' }])
    })

    it('SENTINEL_ANY_VALUE matches every row with a non-blank value, the opposite of the blank sentinel', () => {
        const data = [{ a: 'High' }, { a: '' }, { a: null }, { a: 'Low' }]
        const filters = { a: [SENTINEL_ANY_VALUE] }
        expect(filterData(data, filters)).toEqual([{ a: 'High' }, { a: 'Low' }])
    })

    it('combining SENTINEL_ANY_VALUE with the blank sentinel ("") matches every row', () => {
        const data = [{ a: 'High' }, { a: '' }, { a: null }]
        const filters = { a: [SENTINEL_ANY_VALUE, ''] }
        expect(filterData(data, filters)).toEqual(data)
    })

    describe('date-group filter ({ granularity, prefixes })', () => {
        const data = [
            { a: '2023-05-15 00:00:00.0' },
            { a: '2023-05-16 03:00:00.0' },
            { a: '2024-01-01 00:00:00.0' },
            { a: null },
        ]

        it('matches every row under a single year prefix', () => {
            const filters = {
                a: { granularity: DATE_GROUPS_GRANULARITY, prefixes: ['2023'] },
            }
            expect(filterData(data, filters)).toEqual([
                { a: '2023-05-15 00:00:00.0' },
                { a: '2023-05-16 03:00:00.0' },
            ])
        })

        it('matches only the selected day prefix', () => {
            const filters = {
                a: {
                    granularity: DATE_GROUPS_GRANULARITY,
                    prefixes: ['2023-05-16'],
                },
            }
            expect(filterData(data, filters)).toEqual([
                { a: '2023-05-16 03:00:00.0' },
            ])
        })

        it('ORs across prefixes of different granularities', () => {
            const filters = {
                a: {
                    granularity: DATE_GROUPS_GRANULARITY,
                    prefixes: ['2023-05-15', '2024'],
                },
            }
            expect(filterData(data, filters)).toEqual([
                { a: '2023-05-15 00:00:00.0' },
                { a: '2024-01-01 00:00:00.0' },
            ])
        })

        it('does not treat an empty prefix list as "match nothing" (mirrors the empty-array convention: match everything)', () => {
            const filters = {
                a: { granularity: DATE_GROUPS_GRANULARITY, prefixes: [] },
            }
            expect(filterData(data, filters)).toEqual(data)
        })

        it('SENTINEL_NO_VALUE only matches null/missing values, never startsWith("")-matching everything', () => {
            const filters = {
                a: {
                    granularity: DATE_GROUPS_GRANULARITY,
                    prefixes: [SENTINEL_NO_VALUE],
                },
            }
            expect(filterData(data, filters)).toEqual([{ a: null }])
        })

        it('SENTINEL_ANY_VALUE matches every non-blank value', () => {
            const filters = {
                a: {
                    granularity: DATE_GROUPS_GRANULARITY,
                    prefixes: [SENTINEL_ANY_VALUE],
                },
            }
            expect(filterData(data, filters)).toEqual([
                { a: '2023-05-15 00:00:00.0' },
                { a: '2023-05-16 03:00:00.0' },
                { a: '2024-01-01 00:00:00.0' },
            ])
        })

        it('does not throw and combines (AND) correctly with an unrelated string filter on another field', () => {
            const mixedData = [
                { a: '2023-05-15 00:00:00.0', b: 'apple' },
                { a: '2023-05-16 00:00:00.0', b: 'banana' },
                { a: '2024-01-01 00:00:00.0', b: 'apple' },
            ]
            const filters = {
                a: { granularity: DATE_GROUPS_GRANULARITY, prefixes: ['2023'] },
                b: 'apple',
            }
            expect(filterData(mixedData, filters)).toEqual([
                { a: '2023-05-15 00:00:00.0', b: 'apple' },
            ])
        })
    })
})

describe('filterByGlobalSearch', () => {
    const data = [
        { name: 'Kampala Hospital', type: 'Hospital' },
        { name: 'Entebbe Clinic', type: 'Clinic' },
        { name: 'Jinja Hospital', type: 'Hospital' },
    ]

    it('returns the original data when the search string is empty', () => {
        expect(filterByGlobalSearch(data, '', ['name', 'type'])).toEqual(data)
        expect(filterByGlobalSearch(data, '   ', ['name', 'type'])).toEqual(
            data
        )
    })

    it('returns the original data when there are no string data keys', () => {
        expect(filterByGlobalSearch(data, 'Kampala', [])).toEqual(data)
    })

    it('matches case-insensitively across any of the given fields', () => {
        expect(filterByGlobalSearch(data, 'kampala', ['name', 'type'])).toEqual(
            [{ name: 'Kampala Hospital', type: 'Hospital' }]
        )
    })

    it('matches rows where any field contains the search string', () => {
        expect(
            filterByGlobalSearch(data, 'hospital', ['name', 'type'])
        ).toEqual([
            { name: 'Kampala Hospital', type: 'Hospital' },
            { name: 'Jinja Hospital', type: 'Hospital' },
        ])
    })

    it('returns no rows when nothing matches', () => {
        expect(filterByGlobalSearch(data, 'nairobi', ['name', 'type'])).toEqual(
            []
        )
    })
})
