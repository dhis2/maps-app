import {
    SENTINEL_NO_VALUE,
    SENTINEL_SELECTED_ROW,
} from '../../constants/dataTable.js'
import {
    compareBySelected,
    compareColumnOptionValues,
    compareFieldValues,
    compareRangeValues,
    compareRows,
} from '../tableSort.js'

describe('compareFieldValues', () => {
    it('sorts numbers ascending', () => {
        expect(
            compareFieldValues(5, 10, { sortDirection: 'asc' })
        ).toBeLessThan(0)
    })

    it('sorts numbers descending', () => {
        expect(
            compareFieldValues(5, 10, { sortDirection: 'desc' })
        ).toBeGreaterThan(0)
    })

    it('sorts strings ascending, locale-aware', () => {
        expect(
            compareFieldValues('Apple', 'Banana', { sortDirection: 'asc' })
        ).toBeLessThan(0)
    })

    it('sorts strings descending', () => {
        expect(
            compareFieldValues('Apple', 'Banana', { sortDirection: 'desc' })
        ).toBeGreaterThan(0)
    })

    it('sorts undefined values to the end regardless of direction', () => {
        expect(
            compareFieldValues(undefined, 5, { sortDirection: 'asc' })
        ).toBeGreaterThan(0)
        expect(
            compareFieldValues(5, undefined, { sortDirection: 'desc' })
        ).toBeLessThan(0)
    })

    it('treats two undefined values as equal', () => {
        expect(
            compareFieldValues(undefined, undefined, { sortDirection: 'asc' })
        ).toBe(0)
    })

    it('delegates to compareRangeValues for the Range column', () => {
        expect(
            compareFieldValues('5-10', '1-3', {
                sortField: 'range',
                sortDirection: 'asc',
            })
        ).toBeGreaterThan(0)
    })
})

describe('compareRangeValues', () => {
    it('compares by range start first', () => {
        expect(compareRangeValues('10-20', '1-5', 'asc')).toBeGreaterThan(0)
    })

    it('falls back to range end when starts are equal', () => {
        expect(compareRangeValues('1-20', '1-5', 'asc')).toBeGreaterThan(0)
    })

    it('reverses order when descending', () => {
        expect(compareRangeValues('10-20', '1-5', 'desc')).toBeLessThan(0)
    })
})

describe('compareBySelected', () => {
    const selectedIdSet = new Set(['1'])

    it('puts selected rows first when ascending', () => {
        expect(
            compareBySelected(
                { id: '1' },
                { id: '2' },
                { selectedIdSet, sortDirection: 'asc' }
            )
        ).toBeLessThan(0)
    })

    it('puts selected rows last when descending', () => {
        expect(
            compareBySelected(
                { id: '1' },
                { id: '2' },
                { selectedIdSet, sortDirection: 'desc' }
            )
        ).toBeGreaterThan(0)
    })
})

describe('compareRows', () => {
    it('falls back to natural (index) order when there is no sortField', () => {
        expect(
            compareRows({ index: 2 }, { index: 0 }, { sortField: null })
        ).toBeGreaterThan(0)
    })

    it('sorts by the selected-row sentinel field via compareBySelected', () => {
        const selectedIdSet = new Set(['1'])
        expect(
            compareRows(
                { id: '1' },
                { id: '2' },
                {
                    sortField: SENTINEL_SELECTED_ROW,
                    sortDirection: 'asc',
                    selectedIdSet,
                }
            )
        ).toBeLessThan(0)
    })

    it('otherwise sorts by the named field via compareFieldValues', () => {
        expect(
            compareRows(
                { rawValue: 5 },
                { rawValue: 10 },
                { sortField: 'rawValue', sortDirection: 'asc' }
            )
        ).toBeLessThan(0)
    })
})

describe('compareColumnOptionValues', () => {
    it('sorts the blank-cell sentinel first, regardless of direction', () => {
        expect(
            compareColumnOptionValues(SENTINEL_NO_VALUE, 'High', {
                dataKey: 'legend',
                type: 'string',
                direction: 'desc',
            })
        ).toBeLessThan(0)
        expect(
            compareColumnOptionValues('High', SENTINEL_NO_VALUE, {
                dataKey: 'legend',
                type: 'string',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('compares numeric-typed columns numerically', () => {
        expect(
            compareColumnOptionValues('10', '2', {
                dataKey: 'value',
                type: 'number',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('compares string-typed columns lexically', () => {
        expect(
            compareColumnOptionValues('Apple', 'Banana', {
                dataKey: 'legend',
                type: 'string',
                direction: 'asc',
            })
        ).toBeLessThan(0)
    })

    it('delegates Range columns to compareRangeValues', () => {
        expect(
            compareColumnOptionValues('10-20', '1-5', {
                dataKey: 'range',
                type: 'string',
                direction: 'asc',
            })
        ).toBeGreaterThan(0)
    })

    it('defaults to ascending when no direction is given', () => {
        expect(
            compareColumnOptionValues('Apple', 'Banana', {
                dataKey: 'legend',
                type: 'string',
            })
        ).toBeLessThan(0)
    })
})
