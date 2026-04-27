import {
    DIGIT_GROUP_SEPARATOR_COMMA,
    DIGIT_GROUP_SEPARATOR_NONE,
    DIGIT_GROUP_SEPARATOR_SPACE,
} from '../../constants/settings.js'
import {
    formatCount,
    getPrecision,
    formatWithSeparator,
    parseWithSeparator,
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
