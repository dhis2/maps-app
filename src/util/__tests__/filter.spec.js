import {
    filterData,
    getConditionTest,
    getFilterError,
    isEmptyFilter,
    isSameFilter,
    toFilterKey,
    updateNoValueForCondition,
} from '../filter.js'

describe('filterData', () => {
    test('returns the data as it is without filters', () => {
        const data = [{ a: 1 }, { a: 2 }]
        expect(filterData(data)).toBe(data)
    })
})

describe('filterData with column filters', () => {
    const rows = [
        { name: 'Bo', value: 12, date: '2024-03-01 09:15:00.0', time: '08:10' },
        { name: 'Kénéma', value: 4, date: '2024-05-20', time: '13:30' },
        { name: 'Bombali', value: null, date: null, time: '' },
        { name: 'Kono', value: '  ', date: '', time: null },
    ]
    const keep = (field, filter) =>
        filterData(rows, { [field]: filter }).map((row) => row.name)
    // The rows without a value are left out, as when a condition is set in the popover
    const condition = (type, operator, [value, value2] = []) => ({
        type,
        operator,
        value,
        value2,
        excluded: [''],
    })

    test.each([
        ['contains', ['BO'], ['Bo', 'Bombali']],
        ['notContains', ['bo'], ['Kénéma', 'Kono']],
        ['is', [' bo '], ['Bo']],
        ['startsWith', ['k'], ['Kénéma', 'Kono']],
        ['contains', ['kenema'], ['Kénéma']],
    ])('text %s %j: ignores case, accents and spaces', (op, values, names) => {
        expect(keep('name', condition('text', op, values))).toEqual(names)
    })

    test.each([
        ['eq', [12], ['Bo']],
        ['neq', [12], ['Kénéma']],
        ['gt', [4], ['Bo']],
        ['gte', [4], ['Bo', 'Kénéma']],
        ['lt', [12], ['Kénéma']],
        ['lte', [12], ['Bo', 'Kénéma']],
        ['between', [4, 12], ['Bo', 'Kénéma']],
    ])('number %s %j', (op, values, names) => {
        expect(keep('value', condition('number', op, values))).toEqual(names)
    })

    test.each([
        ['on', ['2024-03-01'], ['Bo']],
        ['before', ['2024-05-20'], ['Bo']],
        ['after', ['2024-03-01'], ['Kénéma']],
        ['between', ['2024-03-01', '2024-05-20'], ['Bo', 'Kénéma']],
    ])('date %s %j: compares by day', (op, values, names) => {
        expect(keep('date', condition('date', op, values))).toEqual(names)
    })

    test.each([
        ['on', ['08:10'], ['Bo']],
        ['before', ['12:00'], ['Bo']],
        ['between', ['12:00', '14:00'], ['Kénéma']],
    ])('time %s %j: compares hours and minutes', (op, values, names) => {
        expect(keep('time', condition('time', op, values))).toEqual(names)
    })

    test('missing, empty and blank values are "No value": kept unless "No value" is unchecked, whatever the condition', () => {
        const contains = { type: 'text', operator: 'contains', value: 'zzz' }
        expect(keep('name', { ...contains, excluded: [] })).toEqual([])
        expect(
            keep('date', { type: 'date', operator: 'on', value: '2024-03-01' })
        ).toEqual(['Bo', 'Bombali', 'Kono'])
        expect(keep('date', { type: 'date', excluded: [''] })).toEqual([
            'Bo',
            'Kénéma',
        ])
    })

    test('a number that isn’t one counts as no value', () => {
        expect(
            filterData([{ value: Number.NaN }, { value: 3 }], {
                value: { type: 'number', excluded: [''] },
            })
        ).toEqual([{ value: 3 }])
    })

    test('leaves out the unchecked values, on top of the condition', () => {
        expect(
            keep('name', {
                ...condition('text', 'contains', ['bo']),
                excluded: ['', 'Bombali'],
            })
        ).toEqual(['Bo'])
        expect(keep('value', { type: 'number', excluded: ['12'] })).toEqual([
            'Kénéma',
            'Bombali',
            'Kono',
        ])
    })

    test('a condition matched on names is applied through the values it leaves out, so the map needs no names', () => {
        const filter = {
            ...condition('text', 'contains', ['Bo District']),
            excludedByCondition: ['Kénéma', 'Kono'],
        }
        expect(keep('name', filter)).toEqual(['Bo', 'Bombali'])
    })

    test.each([
        ['an incomplete Between', condition('number', 'between', [4, ''])],
        ['"Find in list"', condition('text', 'find', ['bo'])],
        ['an unknown operator', condition('text', 'gt', ['bo'])],
    ])('%s is no condition', (_, filter) => {
        expect(keep('value', { ...filter, excluded: [] })).toHaveLength(4)
    })

    test('combines the filters of several columns', () => {
        expect(
            filterData(rows, {
                name: condition('text', 'contains', ['bo']),
                value: condition('number', 'gt', [1]),
            }).map((row) => row.name)
        ).toEqual(['Bo'])
    })

    test('filters GeoJSON features on their properties', () => {
        const features = rows.map((properties) => ({ properties }))
        expect(
            filterData(features, { value: condition('number', 'lt', [5]) })
        ).toEqual([features[1]])
    })
})

describe('column filter helpers', () => {
    test.each([
        [null, ''],
        [undefined, ''],
        ['  ', ''],
        [Number.NaN, ''],
        [0, '0'],
        ['Bo', 'Bo'],
    ])('toFilterKey(%j) is %j', (value, key) => {
        expect(toFilterKey(value)).toBe(key)
    })

    test.each([
        [undefined, true],
        [{ type: 'text', operator: 'contains', value: ' ' }, true],
        [{ type: 'text', operator: 'contains', value: 'bo' }, false],
        [{ type: 'text', operator: 'find', value: 'bo' }, true],
        [{ type: 'number', operator: 'between', value: 1, value2: '' }, true],
        [{ type: 'number', excluded: [] }, true],
        [{ type: 'number', excluded: [''] }, false],
        [{ type: 'text', excludedByCondition: ['Bo'] }, false],
    ])('isEmptyFilter(%j) is %s', (filter, isEmpty) => {
        expect(isEmptyFilter(filter)).toBe(isEmpty)
    })

    const between = (type, value, value2) => ({
        type,
        operator: 'between',
        value,
        value2,
    })

    test.each([
        [{ type: 'number', operator: 'gt', value: 'abc' }, 'Enter a number'],
        [between('number', 1, ''), 'Fill in both values'],
        [between('date', '', '2024-01-01'), 'Fill in both values'],
        [
            between('number', 5, 1),
            'The second number must be greater than the first',
        ],
        [
            between('date', '2024-05-01', '2024-04-01'),
            'The end date must be after the start date',
        ],
        [
            between('time', '14:00', '12:00'),
            'The end time must be after the start time',
        ],
        [between('number', 5, 5), null],
        [{ type: 'text', operator: 'contains', value: '' }, null],
    ])('getFilterError(%j) is %j', (filter, error) => {
        expect(getFilterError(filter)).toBe(error)
    })

    test('getConditionTest tests one value, or is null without a condition', () => {
        const test = getConditionTest({
            type: 'text',
            operator: 'startsWith',
            value: 'kén',
        })
        expect(test('Kenema')).toBe(true)
        expect(test('Bo')).toBe(false)
        expect(getConditionTest({ type: 'text', operator: 'find' })).toBeNull()
    })

    test('drafts that filter the same rows are the same filter', () => {
        expect(
            isSameFilter(
                { type: 'text', excluded: ['b', 'a'] },
                { type: 'text', excluded: ['a', 'b'] }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'number', operator: 'gt', value: 5, excluded: [] },
                { type: 'number', operator: 'gt', value: '5' }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'text', operator: 'contains', value: '' },
                undefined
            )
        ).toBe(true)
        expect(
            isSameFilter(
                {
                    type: 'text',
                    operator: 'find',
                    value: 'bo',
                    excluded: ['x'],
                },
                { type: 'text', excluded: ['x'] }
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

describe('updateNoValueForCondition', () => {
    const contains = (value, excluded) => ({
        type: 'text',
        operator: 'contains',
        value,
        excluded,
    })

    test('setting a condition unchecks "No value"', () => {
        expect(
            updateNoValueForCondition(contains('', ['x']), contains('b', ['x']))
                .excluded
        ).toEqual(['x', ''])
    })

    test('clearing the condition checks "No value" back', () => {
        expect(
            updateNoValueForCondition(
                contains('b', ['', 'x']),
                contains('', ['', 'x'])
            ).excluded
        ).toEqual(['x'])
    })

    test('changing a condition that stays set leaves "No value" as it is', () => {
        const next = contains('bo', [])
        expect(updateNoValueForCondition(contains('b', []), next)).toBe(next)
    })
})
