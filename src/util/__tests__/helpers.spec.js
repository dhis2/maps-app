import { formatValueForDisplay, sumObjectValues } from '../helpers.js'

describe('formatValueForDisplay', () => {
    it.each([
        {
            desc: 'returns "0" as is without transformation',
            input: { value: '0', valueType: 'NUMBER' },
            expected: '0',
        },
        {
            desc: 'returns "1" as is without transformation',
            input: { value: '1', valueType: 'NUMBER' },
            expected: '1',
        },
        {
            desc: 'returns "Not set" for null',
            input: { value: null },
            expected: 'Not set',
        },
        {
            desc: 'returns "Not set" for undefined',
            input: { value: undefined },
            expected: 'Not set',
        },
        {
            desc: 'returns "Not set" for empty string',
            input: { value: '' },
            expected: 'Not set',
        },
        {
            desc: 'returns "Not set" for string "Not set"',
            input: { value: 'Not set' },
            expected: 'Not set',
        },
        {
            desc: 'returns option label if present in options',
            input: {
                value: 'A',
                options: { A: 'Option A', B: 'Option B' },
            },
            expected: 'Option A',
        },
        {
            desc: 'ignores options if value not in options',
            input: {
                value: 'C',
                options: { A: 'Option A', B: 'Option B' },
                valueType: 'TEXT',
            },
            expected: 'C',
        },
        {
            desc: 'formats coordinates (string)',
            input: {
                value: '[12.3456781, 98.7654321]',
                valueType: 'COORDINATE',
            },
            expected: '12.345678, 98.765432',
        },
        {
            desc: 'formats coordinates (array of numbers)',
            input: {
                value: [12.3456781, 98.7654321],
                valueType: 'COORDINATE',
            },
            expected: '12.345678, 98.765432',
        },
        {
            desc: 'formats coordinates (array of strings)',
            input: {
                value: ['12.3456781', '98.7654321'],
                valueType: 'COORDINATE',
            },
            expected: '12.345678, 98.765432',
        },
        {
            desc: 'returns raw value when coordinate parsing fails',
            input: {
                value: 'invalid json',
                valueType: 'COORDINATE',
            },
            expected: 'invalid json',
        },
        {
            desc: 'formats boolean true',
            input: { value: 'true', valueType: 'BOOLEAN' },
            expected: 'Yes',
        },
        {
            desc: 'formats boolean false',
            input: { value: 'false', valueType: 'BOOLEAN' },
            expected: 'No',
        },
        {
            desc: 'returns raw value if boolean is not true/false',
            input: { value: 'maybe', valueType: 'BOOLEAN' },
            expected: 'maybe',
        },
        {
            desc: 'formats date',
            input: { value: '2025-05-08T00:00:00Z', valueType: 'DATE' },
            expected: '2025-05-08',
        },
        {
            desc: 'returns raw value if date is too short',
            input: { value: '2025-05', valueType: 'DATE' },
            expected: '2025-05',
        },
        {
            desc: 'formats datetime',
            input: { value: '2025-05-08T00:00:00Z', valueType: 'DATETIME' },
            expected: '2025-05-08 00:00',
        },
        {
            desc: 'returns raw value if datetime is too short',
            input: { value: '2025-05-08T00', valueType: 'DATETIME' },
            expected: '2025-05-08T00',
        },
        {
            desc: 'returns org unit name if orgUnitNames has the value',
            input: {
                value: 'ou123',
                valueType: 'ORGANISATION_UNIT',
                orgUnitNames: { ou123: 'Sierra Leone' },
            },
            expected: 'Sierra Leone',
        },
        {
            desc: 'returns raw value if orgUnitNames does not have the value',
            input: {
                value: 'ou999',
                valueType: 'ORGANISATION_UNIT',
                orgUnitNames: { ou123: 'Sierra Leone' },
            },
            expected: 'ou999',
        },
    ])('$desc', ({ input, expected }) => {
        expect(formatValueForDisplay(input)).toBe(expected)
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
