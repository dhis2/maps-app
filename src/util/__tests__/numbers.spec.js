import {
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
    DIGIT_GROUP_SEPARATOR_SPACE,
} from '../../constants/settings.js'
import {
    formatCompact,
    formatCount,
    getPrecision,
    formatWithSeparator,
    getCompactScale,
    parseWithSeparator,
    SCIENTIFIC_SCALE,
} from '../numbers.js'

describe('numbers', () => {
    describe('formatCount', () => {
        it('should return the original count for numbers less than 1000', () => {
            expect(formatCount(500)).toEqual(500)
        })

        it('should format numbers between 1000 and 9500 with one decimal place and a "k"', () => {
            expect(formatCount(3300)).toEqual('3.3k')
        })

        it('should round numbers between 9500 and 999500 to the nearest thousand and add a "k"', () => {
            expect(formatCount(33000)).toEqual('33k')
        })

        it('should format numbers between 999500 and 1950000 with one decimal place and a "M"', () => {
            expect(formatCount(1300000)).toEqual('1.3M')
        })

        it('should round numbers greater than 1950000 to the nearest million and add a "M"', () => {
            expect(formatCount(33000000)).toEqual('33M')
        })

        it('should format numbers between 999500000 and 1950000000 with one decimal place and a "B"', () => {
            expect(formatCount(1300000000)).toEqual('1.3B')
        })

        it('should round numbers greater than 1950000000 to the nearest billion and add a "B"', () => {
            expect(formatCount(33000000000)).toEqual('33B')
        })
    })

    describe('getPrecision', () => {
        it('returns 0 for empty array', () => {
            expect(getPrecision([])).toEqual(0)
        })

        it('returns 0 with absValue >=10000', () => {
            expect(getPrecision([10000, 10011, 10020, 10030])).toEqual(0)
        })

        it('returns 0 with absValue >=1000 and gapValue > 10', () => {
            expect(getPrecision([1010, 1000, 1050, 1030])).toEqual(0)
        })

        it('returns 1 with absValue >=1000 and gapValue <= 10', () => {
            expect(getPrecision([1000, 1001.135, 1002, 1003])).toEqual(1)
        })

        it('returns 1 with absValue >=100 and gapValue > 1', () => {
            expect(getPrecision([100, 106, 102, 103])).toEqual(1)
        })

        it('returns 2 with absValue >=100 and gapValue <= 1', () => {
            expect(getPrecision([100.67, 100.1, 100.2, 100.3])).toEqual(2)
        })

        it('returns 2 with absValue >=10 and gapValue > 0.1', () => {
            expect(getPrecision([20.99, 10.1, 10.2, 10.3])).toEqual(2)
        })

        it('returns 3 with absValue >=10 and gapValue <= 0.1', () => {
            expect(getPrecision([10.02, 10.01, 10.03, 10])).toEqual(3)
        })

        it('returns 3 with absValue >=1 and gapValue > 0.01', () => {
            expect(getPrecision([8, 8.07, 8.02, 8.03])).toEqual(3)
        })

        it('returns 4 with absValue >=1 and gapValue <= 0.01', () => {
            expect(getPrecision([1, 1.001, 1.002, 1.003])).toEqual(4)
        })

        it('returns 4 with absValue <1 and gapValue > 0.001', () => {
            expect(getPrecision([0.888, 0.101, 0.102, 0.103])).toEqual(4)
        })

        it('returns 5 with absValue <1 and gapValue <= 0.001', () => {
            expect(getPrecision([0.1, 0.1001, 0.1002, 0.1003])).toEqual(5)
        })

        it('returns 1 with negative max and absValue >=100 and gapValue > 1', () => {
            expect(getPrecision([100, -106, 102, 103])).toEqual(1)
        })

        it('returns 2 with negative max and absValue >=100 and gapValue <= 1', () => {
            expect(getPrecision([-100.67, -100.1, -100.2, -100.3])).toEqual(2)
        })
    })

    describe('formatWithSeparator', () => {
        it('formats positive integers with comma separator', () => {
            expect(
                formatWithSeparator(1234567, DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBe('1,234,567')
        })

        it('formats positive integers with space separator', () => {
            expect(
                formatWithSeparator(1234567, DIGIT_GROUP_SEPARATOR_SPACE)
            ).toBe('1 234 567')
        })

        it('does not group with NONE separator', () => {
            expect(
                formatWithSeparator(1234567, DIGIT_GROUP_SEPARATOR_NONE)
            ).toBe('1234567')
        })

        it('handles negative numbers', () => {
            expect(
                formatWithSeparator(-1234567, DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBe('-1,234,567')
        })

        it('preserves decimals', () => {
            expect(
                formatWithSeparator(1234.56, DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBe('1,234.56')
        })

        it('applies precision when specified', () => {
            expect(
                formatWithSeparator(1234.5, DIGIT_GROUP_SEPARATOR_COMMA, {
                    precision: 3,
                })
            ).toBe('1,234.500')
        })

        it('handles zero', () => {
            expect(formatWithSeparator(0, DIGIT_GROUP_SEPARATOR_COMMA)).toBe(
                '0'
            )
        })

        it('handles numbers below 1000 without grouping', () => {
            expect(formatWithSeparator(42, DIGIT_GROUP_SEPARATOR_COMMA)).toBe(
                '42'
            )
        })

        it('returns non-numeric input unchanged', () => {
            expect(
                formatWithSeparator('hello', DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBe('hello')
            expect(
                formatWithSeparator(null, DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBeNull()
            expect(
                formatWithSeparator(undefined, DIGIT_GROUP_SEPARATOR_COMMA)
            ).toBeUndefined()
        })

        it('forces formatting of numeric strings when force: true', () => {
            expect(
                formatWithSeparator('1234.56', DIGIT_GROUP_SEPARATOR_COMMA, {
                    force: true,
                })
            ).toBe('1,234.56')
        })

        it('treats unknown separator values as NONE', () => {
            expect(formatWithSeparator(1234, 'WEIRD')).toBe(
                formatWithSeparator(1234, DIGIT_GROUP_SEPARATOR_NONE)
            )
        })
    })

    describe('getCompactScale', () => {
        it('returns null for empty array', () => {
            expect(getCompactScale([])).toBeNull()
        })

        it('returns null when all values are zero', () => {
            expect(getCompactScale([0, 0])).toBeNull()
        })

        it('returns null for values in the normal range', () => {
            expect(getCompactScale([850, 999])).toBeNull()
        })

        it('returns k when max >= 1000', () => {
            expect(getCompactScale([500, 1500]).suffix).toBe('k')
        })

        it('returns M when max >= 1,000,000', () => {
            expect(getCompactScale([1_230_000, 5_670_000]).suffix).toBe('M')
        })

        it('returns B when max >= 1,000,000,000 and < 1e12', () => {
            expect(getCompactScale([5_670_000_000]).suffix).toBe('B')
        })

        it('returns scientific scale when max >= 1e12', () => {
            expect(getCompactScale([1e12]).scientific).toBe(true)
            expect(getCompactScale([1e18]).scientific).toBe(true)
        })

        it('returns m for small values < 0.01', () => {
            expect(getCompactScale([0.0045, 0.009]).suffix).toBe('m')
        })

        it('returns μ for very small values < 0.00001', () => {
            expect(getCompactScale([0.0000023]).suffix).toBe('μ')
        })

        it('returns n for extremely small values in range [1e-11, 1e-8)', () => {
            expect(getCompactScale([0.0000000012]).suffix).toBe('n')
        })

        it('returns scientific scale for values < 1e-11', () => {
            expect(getCompactScale([1e-12]).scientific).toBe(true)
            expect(getCompactScale([1e-15]).scientific).toBe(true)
        })

        it('does not compact 0.045 (>= 0.01)', () => {
            expect(getCompactScale([0.045])).toBeNull()
        })
    })

    describe('formatCompact', () => {
        const B = { factor: 1e9, suffix: 'B' }
        const M = { factor: 1e6, suffix: 'M' }
        const K = { factor: 1e3, suffix: 'K' }
        const m = { factor: 1e-3, suffix: 'm' }
        const μ = { factor: 1e-6, suffix: 'μ' }
        const n = { factor: 1e-9, suffix: 'n' }

        it('formats large values with B', () => {
            expect(formatCompact(5_670_000_000, B)).toBe('5.7B')
        })

        it('formats large values with M', () => {
            expect(formatCompact(1_230_000, M)).toBe('1.2M')
        })

        it('formats large values with K', () => {
            expect(formatCompact(12_300, K)).toBe('12.3K')
        })

        it('preserves trailing zero by default (1000 → 1.0K)', () => {
            expect(formatCompact(1_000, K)).toBe('1.0K')
        })

        it('formats sub-threshold value with K (500 → 0.5K)', () => {
            expect(formatCompact(500, K)).toBe('0.5K')
        })

        it('formats small values with m', () => {
            expect(formatCompact(0.0045, m)).toBe('4.5m')
        })

        it('formats very small values with μ', () => {
            expect(formatCompact(0.0000023, μ)).toBe('2.3μ')
        })

        it('formats extremely small values with n', () => {
            expect(formatCompact(0.0000000012, n)).toBe('1.2n')
        })

        it('handles negative values', () => {
            expect(formatCompact(-5_000_000, M)).toBe('-5.0M')
        })

        it('respects explicit decimalPlaces', () => {
            expect(formatCompact(1_234_567, M, { decimalPlaces: 0 })).toBe('1M')
            expect(formatCompact(1_234_567, M, { decimalPlaces: 3 })).toBe(
                '1.235M'
            )
        })

        it('applies thousand separator to scaled values >= 1000', () => {
            expect(
                formatCompact(1_500_000_000_000, B, {
                    decimalPlaces: 2,
                    separator: DIGIT_GROUP_SEPARATOR_COMMA,
                })
            ).toBe('1,500.00B')
        })

        it('formats large values with E⁺ⁿ notation', () => {
            const sci = { scientific: true }
            expect(formatCompact(1e18, sci, { decimalPlaces: 1 })).toBe(
                '1.0E⁺¹⁸'
            )
            expect(
                formatCompact(4.05768693881e14, sci, { decimalPlaces: 6 })
            ).toBe('4.057687E⁺¹⁴')
        })

        it('formats small values with E⁻ⁿ notation', () => {
            const sci = { scientific: true }
            expect(formatCompact(1e-15, sci, { decimalPlaces: 1 })).toBe(
                '1.0E⁻¹⁵'
            )
            expect(formatCompact(-3.5e-13, sci, { decimalPlaces: 2 })).toBe(
                '-3.50E⁻¹³'
            )
        })

        it('uses 1 decimal place by default for scientific notation', () => {
            const sci = { scientific: true }
            expect(formatCompact(2.5e14, sci)).toBe('2.5E⁺¹⁴')
        })
    })

    describe('SCIENTIFIC_SCALE', () => {
        it('is truthy and has scientific flag', () => {
            expect(SCIENTIFIC_SCALE.scientific).toBe(true)
        })

        it('makes formatCompact use E⁺/E⁻ notation', () => {
            expect(
                formatCompact(1e18, SCIENTIFIC_SCALE, { decimalPlaces: 1 })
            ).toBe('1.0E⁺¹⁸')
            expect(
                formatCompact(1e-15, SCIENTIFIC_SCALE, { decimalPlaces: 1 })
            ).toBe('1.0E⁻¹⁵')
        })
    })

    describe('parseWithSeparator', () => {
        it('parses comma-separated integers', () => {
            expect(parseWithSeparator('1,234,567')).toBe(1234567)
        })

        it('parses space-separated integers', () => {
            expect(parseWithSeparator('1 234 567')).toBe(1234567)
        })

        it('parses values with decimals', () => {
            expect(parseWithSeparator('1,234.56')).toBe(1234.56)
        })

        it('parses negative values', () => {
            expect(parseWithSeparator('-1,234')).toBe(-1234)
        })

        it('returns undefined for non-numeric input', () => {
            expect(parseWithSeparator('abc')).toBeUndefined()
        })

        it('round-trips with formatWithSeparator', () => {
            expect(
                parseWithSeparator(
                    formatWithSeparator(1234567, DIGIT_GROUP_SEPARATOR_COMMA)
                )
            ).toBe(1234567)
            expect(
                parseWithSeparator(
                    formatWithSeparator(1234.56, DIGIT_GROUP_SEPARATOR_SPACE)
                )
            ).toBe(1234.56)
        })
    })
})
