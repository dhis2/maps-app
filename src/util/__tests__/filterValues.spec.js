import { RENDERER_ICON } from '../../constants/dataTable.js'
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

    test('orders text alphabetically whatever its case and accents', () => {
        const values = countColumnValues(
            ['Zone', 'apple', 'Évora', 'banana'].map((name) => ({ name })),
            { header: { dataKey: 'name', type: 'string' }, getLabel: String }
        )
        expect(values.map(({ key }) => key)).toEqual([
            '',
            'apple',
            'banana',
            'Évora',
            'Zone',
        ])
    })

    test('orders ranges by their bounds, not as text', () => {
        const values = countColumnValues(
            ['120 – 990', '0 – 30', '30 – 50'].map((range) => ({ range })),
            { header: { dataKey: 'range', type: 'string' }, getLabel: String }
        )
        expect(values.map(({ key }) => key)).toEqual([
            '',
            '0 – 30',
            '30 – 50',
            '120 – 990',
        ])
    })

    describe('columns showing the legend', () => {
        const LEGEND_ITEMS = [
            { name: 'Low', startValue: 0, endValue: 30, color: '#fee' },
            { name: 'High', startValue: 50, endValue: 90, color: '#f00' },
            { name: 'Medium', startValue: 30, endValue: 50, color: '#f88' },
        ]
        const CLASSED_ROWS = [
            { legend: 'Low', range: '0 – 30', color: '#fee' },
            { legend: 'Medium', range: '30 – 50', color: '#f88' },
            { legend: 'High', range: '50 – 90', color: '#f00' },
        ]
        const count = (dataKey, options) =>
            countColumnValues(CLASSED_ROWS, {
                header: { dataKey, type: 'string' },
                getLabel: String,
                legendItems: LEGEND_ITEMS,
                ...options,
            })

        test('lists Range in the legend’s order, highest class first as in the layer card', () => {
            expect(count('range').map(({ key }) => key)).toEqual([
                '',
                '50 – 90',
                '30 – 50',
                '0 – 30',
            ])
        })

        test('lists Legend in the legend’s order, each class with its color', () => {
            expect(
                count('legend').map(({ key, color }) => [key, color])
            ).toEqual([
                ['', undefined],
                ['High', '#f00'],
                ['Medium', '#f88'],
                ['Low', '#fee'],
            ])
        })

        test('lists "No data" last, as the layer card does', () => {
            const values = countColumnValues(
                [{ legend: 'No data', color: '#ccc' }, ...CLASSED_ROWS],
                {
                    header: { dataKey: 'legend', type: 'string' },
                    getLabel: String,
                    legendItems: [
                        { name: 'No data', color: '#ccc', isNoData: true },
                        ...LEGEND_ITEMS,
                    ],
                }
            )
            expect(values.map(({ key }) => key)).toEqual([
                '',
                'High',
                'Medium',
                'Low',
                'No data',
            ])
        })

        test('lists Color and Icon in the group set’s order, values outside the legend last', () => {
            const values = countColumnValues(
                [
                    { legend: 'Hospital', group: 'Hospital', iconUrl: 'a.png' },
                    { iconUrl: 'z.png' },
                    { legend: 'Clinic', group: 'Clinic', iconUrl: 'b.png' },
                ],
                {
                    header: { dataKey: 'iconUrl', renderer: RENDERER_ICON },
                    getLabel: String,
                    legendItems: [{ name: 'Clinic' }, { name: 'Hospital' }],
                }
            )
            expect(values.map(({ key }) => key)).toEqual([
                '',
                'b.png',
                'a.png',
                'z.png',
            ])
        })

        describe('layers styled by a group set', () => {
            const GROUP_ROWS = [
                { legend: 'MCHP', group: 'MCHP', iconUrl: 'm.png' },
                { legend: 'Unclassified', color: '#ccc' },
                { legend: 'CHC', group: 'CHC', iconUrl: 'c.png' },
            ]
            const GROUP_ITEMS = [
                { name: 'MCHP', image: 'm.png' },
                { name: 'CHC', image: 'c.png' },
                { name: 'Unclassified', color: '#ccc' },
            ]
            const countGroups = (dataKey) =>
                countColumnValues(GROUP_ROWS, {
                    header: { dataKey, type: 'string' },
                    getLabel: String,
                    legendItems: GROUP_ITEMS,
                })

            test('lists Legend in the legend’s order, each class with its icon or color', () => {
                expect(
                    countGroups('legend').map(({ key, iconUrl, color }) => [
                        key,
                        iconUrl,
                        color,
                    ])
                ).toEqual([
                    ['', undefined, undefined],
                    ['MCHP', 'm.png', undefined],
                    ['CHC', 'c.png', undefined],
                    ['Unclassified', undefined, '#ccc'],
                ])
            })

            test('lists Group in the legend’s order, as Range for thematic layers', () => {
                expect(countGroups('group').map(({ key }) => key)).toEqual([
                    '',
                    'MCHP',
                    'CHC',
                ])
            })
        })

        test('lists automatic classes, named by their range, in the legend’s order by their color', () => {
            const values = countColumnValues(
                [
                    { legend: '0 – 30', color: '#fee' },
                    { legend: '50 – 90', color: '#f00' },
                    { legend: '30 – 50', color: '#f88' },
                ],
                {
                    header: { dataKey: 'legend', type: 'string' },
                    getLabel: String,
                    legendItems: LEGEND_ITEMS.map((item) => ({
                        ...item,
                        name: undefined,
                    })),
                }
            )
            expect(values.map(({ key }) => key)).toEqual([
                '',
                '50 – 90',
                '30 – 50',
                '0 – 30',
            ])
        })

        test('reverses the legend’s order when the table sorts the column descending, "No data" still last', () => {
            const values = countColumnValues(
                [{ legend: 'No data', color: '#ccc' }, ...CLASSED_ROWS],
                {
                    header: { dataKey: 'legend', type: 'string' },
                    getLabel: String,
                    legendItems: [
                        { name: 'No data', color: '#ccc', isNoData: true },
                        ...LEGEND_ITEMS,
                    ],
                    sorting: { sortField: 'legend', sortDirection: 'desc' },
                }
            )
            expect(values.map(({ key }) => key)).toEqual([
                '',
                'Low',
                'Medium',
                'High',
                'No data',
            ])
        })
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
