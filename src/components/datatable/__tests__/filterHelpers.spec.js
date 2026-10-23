import {
    getFilterError,
    isEmptyFilter,
    isSameFilter,
    isValidFilter,
} from '../filters/filterHelpers.js'

const between = (value, value2) => ({
    type: 'number',
    operator: 'between',
    value,
    value2,
})

describe('filterHelpers', () => {
    test('isEmptyFilter treats a half-filled Between as not empty', () => {
        expect(isEmptyFilter(between('', ''))).toBe(true)
        expect(isEmptyFilter(between('5', ''))).toBe(false)
        expect(isEmptyFilter(between('', '5'))).toBe(false)
    })

    test('isValidFilter rejects incomplete and reversed ranges', () => {
        expect(isValidFilter(undefined)).toBe(true)
        expect(isValidFilter(between('1', '5'))).toBe(true)
        expect(isValidFilter(between('5', ''))).toBe(false)
        expect(isValidFilter(between('5', '1'))).toBe(false)
        expect(
            isValidFilter({
                type: 'date',
                from: '2024-02-01',
                to: '2024-01-01',
            })
        ).toBe(false)
        expect(isValidFilter({ type: 'date', from: '2024-02-01' })).toBe(true)
    })

    test('getFilterError compares numbers, not strings', () => {
        expect(getFilterError(between('9', '10'))).toBeNull()
        expect(getFilterError(between('10', '9'))).toBeTruthy()
    })

    test('isSameFilter treats empty drafts as no filter', () => {
        expect(isSameFilter(undefined, undefined)).toBe(true)
        expect(isSameFilter({ type: 'text', value: '' }, undefined)).toBe(true)
        expect(isSameFilter({ type: 'text', value: 'a' }, undefined)).toBe(
            false
        )
    })

    test('isSameFilter ignores option order and stale Between values', () => {
        expect(
            isSameFilter(
                { type: 'options', values: ['b', 'a'] },
                { type: 'options', values: ['a', 'b'] }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'number', operator: 'gt', value: '5', value2: '9' },
                { type: 'number', operator: 'gt', value: '5' }
            )
        ).toBe(true)
        expect(
            isSameFilter(
                { type: 'number', operator: 'gt', value: '5' },
                { type: 'number', operator: 'gte', value: '5' }
            )
        ).toBe(false)
    })
})
