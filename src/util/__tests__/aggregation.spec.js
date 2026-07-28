import { applyAggregation } from '../aggregation.js'

describe('applyAggregation', () => {
    test('returns null for an empty input (no matching feature)', () => {
        expect(applyAggregation('SUM', [])).toBeNull()
    })

    test('SUM', () => {
        expect(applyAggregation('SUM', [1, 2, 3])).toBe(6)
    })

    test('AVERAGE', () => {
        expect(applyAggregation('AVERAGE', [1, 2, 3])).toBe(2)
    })

    test('COUNT', () => {
        expect(applyAggregation('COUNT', [10, 20, 30, 40])).toBe(4)
    })

    test('MIN', () => {
        expect(applyAggregation('MIN', [5, 1, 9])).toBe(1)
    })

    test('MAX', () => {
        expect(applyAggregation('MAX', [5, 1, 9])).toBe(9)
    })

    test('VARIANCE', () => {
        expect(applyAggregation('VARIANCE', [2, 4, 4, 4, 5, 5, 7, 9])).toBe(4)
    })

    test('STDDEV', () => {
        expect(applyAggregation('STDDEV', [2, 4, 4, 4, 5, 5, 7, 9])).toBe(2)
    })

    test('a single value aggregates to itself regardless of type', () => {
        expect(applyAggregation('SUM', [42])).toBe(42)
        expect(applyAggregation('AVERAGE', [42])).toBe(42)
        expect(applyAggregation('MIN', [42])).toBe(42)
        expect(applyAggregation('MAX', [42])).toBe(42)
    })

    test('returns null for an unknown aggregation type', () => {
        expect(applyAggregation('NOT_A_TYPE', [1, 2, 3])).toBeNull()
    })
})
