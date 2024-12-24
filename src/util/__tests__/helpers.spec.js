import { sumObjectValues } from '../helpers.js'

describe('sumObjectValues', () => {
    it('should return 0 for an empty object', () => {
        expect(sumObjectValues({})).toBe(0)
    })

    it('should sum flat numeric values in an object', () => {
        expect(sumObjectValues({ a: 1, b: 2, c: 3 })).toBe(6)
    })

    it('should handle nested objects correctly', () => {
        const obj = {
            a: 1,
            b: { c: 2, d: { e: 3 } },
        }
        expect(sumObjectValues(obj)).toBe(6)
    })

    it('should ignore non-numeric values', () => {
        const obj = {
            a: 1,
            b: 'string',
            c: { d: 2, e: null, f: true },
        }
        expect(sumObjectValues(obj)).toBe(3)
    })

    it('should handle an object with only non-numeric values', () => {
        const obj = {
            a: 'string',
            b: null,
            c: undefined,
        }
        expect(sumObjectValues(obj)).toBe(0)
    })

    it('should handle arrays as object values', () => {
        const obj = {
            a: [1, 2, 3],
            b: { c: [4, 5], d: 6 },
        }
        expect(sumObjectValues(obj)).toBe(21) // Note: Array elements aren't handled differently, treated as objects.
    })
})
