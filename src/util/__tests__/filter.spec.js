import {
    filterData,
    getFilterError,
    isEmptyFilter,
    isSameFilter,
    isValidFilter,
} from '../filter.js'

describe('filterData', () => {
    test('returns the data as it is without filters', () => {
        const data = [{ a: 1 }, { a: 2 }]
        expect(filterData(data)).toBe(data)
    })
})

describe('filterData with column filters', () => {
    const rows = [
        { name: 'Bo', value: 12, date: '2024-03-01 09:15:00.0' },
        { name: 'Kono', value: 4, date: '2024-05-20' },
        { name: 'Bombali', value: null, date: null },
    ]
    const keep = (field, filter) =>
        filterData(rows, { [field]: filter }).map((row) => row.name)

    test('text: keeps the rows whose value contains the text, in any case', () => {
        expect(
            keep('name', { type: 'text', operator: 'contains', value: 'BO' })
        ).toEqual(['Bo', 'Bombali'])
    })

    test.each([
        [{ operator: 'eq', value: 12 }, ['Bo']],
        [{ operator: 'neq', value: 12 }, ['Kono']],
        [{ operator: 'gt', value: 4 }, ['Bo']],
        [{ operator: 'gte', value: 4 }, ['Bo', 'Kono']],
        [{ operator: 'lt', value: 12 }, ['Kono']],
        [{ operator: 'lte', value: 12 }, ['Bo', 'Kono']],
        [{ operator: 'between', value: 12, value2: 4 }, ['Bo', 'Kono']],
    ])('number %j: never keeps rows without a value', (filter, names) => {
        expect(keep('value', { type: 'number', ...filter })).toEqual(names)
    })

    test('options: keeps the rows with one of the values, empty values included', () => {
        expect(keep('name', { type: 'options', values: ['Kono'] })).toEqual([
            'Kono',
        ])
        expect(keep('value', { type: 'options', values: ['12', ''] })).toEqual([
            'Bo',
            'Bombali',
        ])
    })

    test('date: compares the day only, and keeps open ends', () => {
        expect(
            keep('date', { type: 'date', from: '2024-03-01', to: '2024-03-01' })
        ).toEqual(['Bo'])
        expect(keep('date', { type: 'date', from: '2024-04-01' })).toEqual([
            'Kono',
        ])
        expect(keep('date', { type: 'date', to: '2024-04-01' })).toEqual(['Bo'])
    })

    test.each(['text', 'number', 'date'])(
        '%s: is empty and is not empty',
        (type) => {
            expect(keep('date', { type, operator: 'empty' })).toEqual([
                'Bombali',
            ])
            expect(keep('date', { type, operator: 'notEmpty' })).toEqual([
                'Bo',
                'Kono',
            ])
        }
    )

    test('combines the filters of several columns', () => {
        expect(
            filterData(rows, {
                name: { type: 'text', operator: 'contains', value: 'bo' },
                value: { type: 'number', operator: 'gt', value: 1 },
            }).map((row) => row.name)
        ).toEqual(['Bo'])
    })

    test('filters GeoJSON features on their properties', () => {
        const features = rows.map((properties) => ({ properties }))
        expect(
            filterData(features, {
                value: { type: 'number', operator: 'lt', value: 5 },
            })
        ).toEqual([features[1]])
    })
})

describe('column filter drafts', () => {
    test.each([
        [undefined, true],
        [{ type: 'text', value: ' ' }, true],
        [{ type: 'text', value: 'bo' }, false],
        [{ type: 'number', operator: 'gt', value: '' }, true],
        [{ type: 'number', operator: 'gt', value: 0 }, false],
        [{ type: 'options', values: [] }, true],
        [{ type: 'options', values: [''] }, false],
        [{ type: 'date' }, true],
        [{ type: 'date', to: '2024-01-01' }, false],
        [{ type: 'text', operator: 'empty' }, false],
    ])('isEmptyFilter(%j) is %s', (filter, isEmpty) => {
        expect(isEmptyFilter(filter)).toBe(isEmpty)
    })

    test('a number range needs both bounds, in order', () => {
        const range = (value, value2) => ({
            type: 'number',
            operator: 'between',
            value,
            value2,
        })
        expect(isValidFilter(range(1, ''))).toBe(false)
        expect(isValidFilter(range(5, 1))).toBe(false)
        expect(getFilterError(range(5, 1))).toBe('Max must be greater than Min')
        expect(isValidFilter(range(1, 5))).toBe(true)
        expect(isValidFilter(range(5, 5))).toBe(true)
    })

    test('a date range needs the end after the start', () => {
        const range = { type: 'date', from: '2024-05-01', to: '2024-04-01' }
        expect(isValidFilter(range)).toBe(false)
        expect(getFilterError(range)).toBe('To must be after From')
    })

    test('drafts that filter the same rows are the same filter', () => {
        expect(
            isSameFilter(
                { type: 'options', values: ['b', 'a'] },
                { type: 'options', values: ['a', 'b'] }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'number', operator: 'gt', value: 5 },
                { type: 'number', operator: 'gt', value: '5' }
            )
        ).toBe(true)
        expect(isSameFilter({ type: 'text', value: '' }, undefined)).toBe(true)
        expect(
            isSameFilter(
                { type: 'text', operator: 'empty', value: 'bo' },
                { type: 'text', operator: 'empty' }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'number', operator: 'gt', value: 5 },
                { type: 'number', operator: 'lt', value: 5 }
            )
        ).toBe(false)
    })
})
