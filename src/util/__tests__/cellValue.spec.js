import {
    RENDERER_COLOR,
    RENDERER_DATE,
    RENDERER_ORG_UNIT,
    RENDERER_ORG_UNIT_NAME,
    RENDERER_BOOLEAN,
    TYPE_DATE,
    TYPE_DATETIME,
} from '../../constants/dataTable.js'
import { formatCellText, NO_VALUE_TEXT } from '../cellValue.js'

describe('formatCellText', () => {
    it('returns the em-dash placeholder for a missing value, regardless of renderer', () => {
        expect(formatCellText(null)).toBe(NO_VALUE_TEXT)
        expect(formatCellText(undefined, { renderer: RENDERER_BOOLEAN })).toBe(
            NO_VALUE_TEXT
        )
    })

    it('lowercases a color value', () => {
        expect(formatCellText('#ABCDEF', { renderer: RENDERER_COLOR })).toBe(
            '#abcdef'
        )
    })

    it('formats a date-only value with no time portion', () => {
        expect(
            formatCellText('2024-01-15T10:30:00.000', {
                renderer: RENDERER_DATE,
                type: TYPE_DATE,
            })
        ).toBe('2024-01-15')
    })

    it('formats a datetime value including the time portion', () => {
        expect(
            formatCellText('2024-01-15T10:30:00.000', {
                renderer: RENDERER_DATE,
                type: TYPE_DATETIME,
            })
        ).toBe('2024-01-15 10:30')
    })

    it('formats an org-unit-hierarchy value as a breadcrumb', () => {
        const orgUnitIdToName = new Map([
            ['country1', 'Country'],
            ['ou1', 'Facility'],
        ])
        expect(
            formatCellText('/country1/ou1', {
                renderer: RENDERER_ORG_UNIT,
                orgUnitIdToName,
            })
        ).toBe('Country / Facility')
    })

    it('falls back to the raw id for an org-unit segment missing from the id-to-name map', () => {
        const orgUnitIdToName = new Map([['country1', 'Country']])
        expect(
            formatCellText('/country1/ou1', {
                renderer: RENDERER_ORG_UNIT,
                orgUnitIdToName,
            })
        ).toBe('Country / ou1')
    })

    it("formats an org-unit-name value as just the feature's own name", () => {
        const orgUnitIdToName = new Map([['ou1', 'Facility']])
        expect(
            formatCellText('/country1/ou1', {
                renderer: RENDERER_ORG_UNIT_NAME,
                orgUnitIdToName,
            })
        ).toBe('Facility')
    })

    it('formats a boolean-renderer value as Yes/No', () => {
        expect(formatCellText('1', { renderer: RENDERER_BOOLEAN })).toBe('Yes')
        expect(formatCellText('0', { renderer: RENDERER_BOOLEAN })).toBe('No')
    })

    it('formats a plain number with the digit-group separator', () => {
        expect(
            formatCellText(1234567, { keyAnalysisDigitGroupSeparator: 'COMMA' })
        ).toBe('1,234,567')
    })

    it('formats a plain number with no separator when none is given', () => {
        expect(formatCellText(1234567)).toBe('1234567')
    })

    it('leaves a plain string untouched', () => {
        expect(formatCellText('Bo')).toBe('Bo')
    })
})
