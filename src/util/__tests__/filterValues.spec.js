import {
    countColumnValues,
    countKeptRows,
    getListedValues,
    getRowsForColumn,
    toAppliedFilter,
} from '../filterValues.js'

const ROWS = [
    { ou: 'ou1', value: 5, gender: 'F' },
    { ou: 'ou2', value: 12, gender: 'M' },
    { ou: 'ou1', value: null, gender: 'F' },
    { ou: 'ou3', value: 5, gender: '' },
]
const NAMES = { ou1: 'Bo', ou2: 'Bombali', ou3: 'Kenema' }

const orgUnits = (rows = ROWS) =>
    countColumnValues(rows, {
        header: { dataKey: 'ou', type: 'string' },
        getLabel: (value) => NAMES[value],
        byLabel: true,
    })

const numbers = (rows = ROWS) =>
    countColumnValues(rows, {
        header: { dataKey: 'value', type: 'number' },
        getLabel: String,
    })

const draft = (fields) => ({ excluded: [], ...fields })
const keys = ({ listed }) => listed.map(({ key }) => key)

describe('countColumnValues', () => {
    test('counts each value, "No value" first even without rows, then by label where cells show names', () => {
        expect(orgUnits()).toEqual([
            { key: '', label: '', count: 0 },
            { key: 'ou1', value: 'ou1', label: 'Bo', count: 2 },
            { key: 'ou2', value: 'ou2', label: 'Bombali', count: 1 },
            { key: 'ou3', value: 'ou3', label: 'Kenema', count: 1 },
        ])
    })

    test('orders numbers as numbers, missing values counted as "No value"', () => {
        expect(numbers().map(({ key, count }) => [key, count])).toEqual([
            ['', 1],
            ['5', 2],
            ['12', 1],
        ])
    })

    test('lists the values of the column the table is sorted by in the rows’ order, "No value" first', () => {
        const values = countColumnValues(ROWS, {
            header: { dataKey: 'value', type: 'number' },
            getLabel: String,
            sorting: { sortField: 'value', sortDirection: 'desc' },
        })
        expect(values.map(({ key }) => key)).toEqual(['', '12', '5'])
    })

    test('keeps the default order when the table is sorted by another column', () => {
        const values = countColumnValues(ROWS, {
            header: { dataKey: 'value', type: 'number' },
            getLabel: String,
            sorting: { sortField: 'gender', sortDirection: 'desc' },
        })
        expect(values.map(({ key }) => key)).toEqual(['', '5', '12'])
    })
})

describe('getRowsForColumn', () => {
    test('applies the other columns’ filters only', () => {
        const filters = {
            gender: { type: 'text', excluded: ['M'] },
            value: { type: 'number', excluded: ['5'] },
        }
        expect(getRowsForColumn(ROWS, filters, 'value')).toEqual([
            ROWS[0],
            ROWS[2],
            ROWS[3],
        ])
    })
})

describe('getListedValues', () => {
    test('lists the values passing the condition, on their names where cells show names, and counts the others', () => {
        const result = getListedValues(
            orgUnits(),
            draft({ type: 'text', operator: 'startsWith', value: 'bo' }),
            { matchOnLabel: true }
        )
        expect(keys(result)).toEqual(['', 'ou1', 'ou2'])
        expect(result.hidden).toBe(1)
    })

    test('"Find in list" lists the values whose name contains the text, without "No value"', () => {
        const result = getListedValues(
            orgUnits(),
            draft({ type: 'text', operator: 'find', value: 'BOM' }),
            { matchOnLabel: true }
        )
        expect(keys(result)).toEqual(['ou2'])
        expect(result.hidden).toBe(0)
    })

    test('keeps listing an unchecked value no row has any more', () => {
        const result = getListedValues(
            orgUnits(),
            draft({ type: 'text', excluded: ['ou9'] }),
            { matchOnLabel: true }
        )
        expect(result.listed.at(-1)).toEqual({
            key: 'ou9',
            label: 'ou9',
            count: 0,
            isGone: true,
        })
    })
})

describe('countKeptRows', () => {
    test('counts the rows of the values passing the condition and checked, "No value" following its checkbox', () => {
        const values = numbers()
        const between = draft({
            type: 'number',
            operator: 'between',
            value: '1',
            value2: '10',
        })
        expect(countKeptRows(values, between, { matchOnLabel: false })).toBe(3)
        expect(
            countKeptRows(
                values,
                { ...between, excluded: [''] },
                { matchOnLabel: false }
            )
        ).toBe(2)
    })
})

describe('toAppliedFilter', () => {
    test('keeps no condition for "Find in list" or an incomplete one', () => {
        expect(
            toAppliedFilter(
                draft({ type: 'text', operator: 'find', value: 'bo' }),
                { matchOnLabel: true, allValues: orgUnits() }
            )
        ).toEqual({ type: 'text', excluded: [] })
    })

    test('stores a condition on names as the values it leaves out, among all rows', () => {
        expect(
            toAppliedFilter(
                draft({
                    type: 'text',
                    operator: 'contains',
                    value: 'bo',
                    excluded: [''],
                }),
                { matchOnLabel: true, allValues: orgUnits() }
            )
        ).toEqual({
            type: 'text',
            operator: 'contains',
            value: 'bo',
            value2: undefined,
            excluded: [''],
            excludedByCondition: ['ou3'],
        })
    })

    test('keeps a condition on values as it is', () => {
        expect(
            toAppliedFilter(
                draft({ type: 'number', operator: 'gt', value: '6' }),
                { matchOnLabel: false, allValues: numbers() }
            )
        ).toEqual({
            type: 'number',
            operator: 'gt',
            value: '6',
            value2: undefined,
            excluded: [],
        })
    })
})
