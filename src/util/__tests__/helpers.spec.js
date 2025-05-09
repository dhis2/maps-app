import { formatValueForDisplay, sumObjectValues } from '../helpers.js'

describe('formatValueForDisplay', () => {
    it('returns "0", "1" as is without transformation', () => {
        expect(formatValueForDisplay({ value: '0', valueType: 'NUMBER' })).toBe(
            '0'
        )
        expect(formatValueForDisplay({ value: '1', valueType: 'NUMBER' })).toBe(
            '1'
        )
    })

    it('returns "Not set" for null/undefined/empty string', () => {
        expect(formatValueForDisplay({ value: null })).toBe('Not set')
        expect(formatValueForDisplay({ value: undefined })).toBe('Not set')
        expect(formatValueForDisplay({ value: '' })).toBe('Not set')
        expect(formatValueForDisplay({ value: 'Not set' })).toBe('Not set')
    })

    it('returns option label if present in options', () => {
        const result = formatValueForDisplay({
            value: 'A',
            options: { A: 'Option A', B: 'Option B' },
        })
        expect(result).toBe('Option A')
    })

    it('ignores options if value not in options', () => {
        const result = formatValueForDisplay({
            value: 'C',
            options: { A: 'Option A', B: 'Option B' },
            valueType: 'TEXT',
        })
        expect(result).toBe('C')
    })

    it('formats coordinates when valueType is coordinate (string)', () => {
        const result = formatValueForDisplay({
            value: '[12.3456781, 98.7654321]',
            valueType: 'COORDINATE',
        })
        expect(result).toBe('12.345678, 98.765432')
    })

    it('formats coordinates when valueType is coordinate (array of numbers)', () => {
        const result = formatValueForDisplay({
            value: [12.3456781, 98.7654321],
            valueType: 'COORDINATE',
        })
        expect(result).toBe('12.345678, 98.765432')
    })

    it('formats coordinates when valueType is coordinate (array of strings)', () => {
        const result = formatValueForDisplay({
            value: ['12.3456781', '98.7654321'],
            valueType: 'COORDINATE',
        })
        expect(result).toBe('12.345678, 98.765432')
    })

    it('returns raw value when coordinate parsing fails', () => {
        const result = formatValueForDisplay({
            value: 'invalid json',
            valueType: 'COORDINATE',
        })
        expect(result).toBe('invalid json')
    })

    it('formats boolean true/false', () => {
        const trueResult = formatValueForDisplay({
            value: 'true',
            valueType: 'BOOLEAN',
        })
        expect(trueResult).toBe('Yes')

        const falseResult = formatValueForDisplay({
            value: 'false',
            valueType: 'BOOLEAN',
        })
        expect(falseResult).toBe('No')
    })

    it('returns raw value if boolean is not true/false', () => {
        const result = formatValueForDisplay({
            value: 'maybe',
            valueType: 'BOOLEAN',
        })
        expect(result).toBe('maybe')
    })

    it('formats date', () => {
        const result = formatValueForDisplay({
            value: '2025-05-08T00:00:00Z',
            valueType: 'DATE',
        })
        expect(result).toBe('2025-05-08')
    })

    it('returns raw value if date is too short', () => {
        const result = formatValueForDisplay({
            value: '2025-05',
            valueType: 'DATE',
        })
        expect(result).toBe('2025-05')
    })

    it('formats datetime', () => {
        const result = formatValueForDisplay({
            value: '2025-05-08T00:00:00Z',
            valueType: 'DATETIME',
        })
        expect(result).toBe('2025-05-08 00:00')
    })

    it('returns raw value if datetime is too short', () => {
        const result = formatValueForDisplay({
            value: '2025-05-08T00',
            valueType: 'DATETIME',
        })
        expect(result).toBe('2025-05-08T00')
    })

    it('returns raw value for other DHIS2 types not specially handled', () => {
        const samplesByType = {
            TEXT: 'Hello world',
            LONG_TEXT:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.',
            LETTER: 'A',
            PHONE_NUMBER: '+4733987937',
            EMAIL: 'user@example.com',
            TIME: '13:45',
            NUMBER: '42.0',
            UNIT_INTERVAL: '0.75',
            PERCENTAGE: '85',
            INTEGER: '-10',
            INTEGER_POSITIVE: '7',
            INTEGER_NEGATIVE: '-3',
            INTEGER_ZERO_OR_POSITIVE: '0',
            USERNAME: 'jdoe',
            ORGANISATION_UNIT: 'Sierra Leone',
            URL: 'https://dhis2.org',
            GEOJSON: '{"type":"Point","coordinates":[125.6, 10.1]}',
        }

        Object.entries(samplesByType).forEach(([type, sample]) => {
            const result = formatValueForDisplay({
                value: sample,
                valueType: type,
            })
            expect(result).toEqual(sample)
        })
    })
})

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
