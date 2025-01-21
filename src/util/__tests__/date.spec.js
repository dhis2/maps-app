import { getNowInCalendar } from '@dhis2/multi-calendar-dates'
import {
    getMaxDaysInMonth,
    getMaxMonthsInYear,
    getCurrentYearInCalendar,
    formatDateInput,
    formatDateOnBlur,
    getDefaultDatesInCalendar,
} from '../date.js'

jest.mock('@dhis2/multi-calendar-dates', () => ({
    getNowInCalendar: jest.fn(),
}))

describe('getMaxDaysInMonth', () => {
    const testCases = [
        {
            calendar: 'iso8601',
            year: 2024,
            month: 2,
            expectedDays: 29, // Leap year in ISO8601
        },
        {
            calendar: 'iso8601',
            year: 2023,
            month: 2,
            expectedDays: 28, // Non-leap year in ISO8601
        },
        {
            calendar: 'gregory',
            year: 2024,
            month: 2,
            expectedDays: 29, // Leap year in Gregorian
        },
        {
            calendar: 'gregorian',
            year: 2023,
            month: 2,
            expectedDays: 28, // Non-leap year in Gregorian
        },
        {
            calendar: 'julian',
            year: 2024,
            month: 2,
            expectedDays: 29, // Leap year in Julian
        },
        {
            calendar: 'julian',
            year: 2023,
            month: 2,
            expectedDays: 28, // Non-leap year in Julian
        },
        {
            calendar: 'thai',
            year: 2567,
            month: 2,
            expectedDays: 29, // Leap year in Thai
        },
        {
            calendar: 'thai',
            year: 2566,
            month: 2,
            expectedDays: 28, // Non-leap year in Thai
        },
        {
            calendar: 'coptic',
            year: 2024,
            month: 13,
            expectedDays: 5, // Non-leap year in Coptic
        },
        {
            calendar: 'coptic',
            year: 2023,
            month: 13,
            expectedDays: 6, // Leap year in Coptic
        },
        {
            calendar: 'ethiopian',
            year: 2024,
            month: 13,
            expectedDays: 5, // Non-leap in Ethiopian
        },
        {
            calendar: 'ethiopic',
            year: 2023,
            month: 13,
            expectedDays: 6, // Leap year in Ethiopian
        },
        {
            calendar: 'persian',
            year: 1403,
            month: 12,
            expectedDays: 30, // Leap year in Persian
        },
        {
            calendar: 'persian',
            year: 142,
            month: 12,
            expectedDays: 29, // Non-leap year in Persian
        },
        {
            calendar: 'islamic',
            year: 1447,
            month: 12,
            expectedDays: 30, // Leap year in Islamic
        },
        {
            calendar: 'islamic',
            year: 1445,
            month: 12,
            expectedDays: 29, // Non-leap year in Islamic
        },
        {
            calendar: 'nepali',
            year: 2081,
            month: 12,
            expectedDays: 31, // No leap year logic in Nepali
        },
        {
            calendar: 'nepali',
            year: 2080,
            month: 12,
            expectedDays: 30, // No leap year logic in Nepali
        },
    ]

    testCases.forEach(({ calendar, year, month, expectedDays }) => {
        it(`should return the correct number of days for ${calendar} calendar in ${year}-${month}`, () => {
            const result = getMaxDaysInMonth(year, month, calendar)
            expect(result).toBe(expectedDays)
        })
    })
})

describe('getMaxMonthsInYear', () => {
    const testCases = [
        { calendar: 'iso8601', year: 2024, expectedMonths: 12 },
        { calendar: 'gregory', year: 2024, expectedMonths: 12 },
        { calendar: 'coptic', year: 2024, expectedMonths: 13 },
        { calendar: 'ethiopian', year: 2024, expectedMonths: 13 },
        { calendar: 'islamic', year: 1445, expectedMonths: 12 },
        { calendar: 'julian', year: 2024, expectedMonths: 12 },
        { calendar: 'nepali', year: 2081, expectedMonths: 12 },
        { calendar: 'thai', year: 2567, expectedMonths: 12 },
        { calendar: 'persian', year: 1402, expectedMonths: 12 },
    ]

    testCases.forEach(({ calendar, year, expectedMonths }) => {
        it(`should return the correct number of months for ${calendar} calendar in ${year}`, () => {
            const result = getMaxMonthsInYear(year, calendar)
            expect(result).toBe(expectedMonths)
        })
    })
})

describe('getDefaultDatesInCalendar', () => {
    it('should calculate correct startDate and endDate', () => {
        getNowInCalendar.mockReturnValue({
            day: 15,
            month: 7,
            eraYear: 2024,
        })

        const result = getDefaultDatesInCalendar()
        expect(result.startDate).toBe('2023-07-15') // One year before
        expect(result.endDate).toBe('2024-07-15') // Current year
    })
})

describe('getCurrentYearInCalendar', () => {
    getNowInCalendar.mockReturnValue({
        day: 15,
        month: 7,
        eraYear: 2024,
    })

    it('returns the current year', () => {
        expect(getCurrentYearInCalendar('gregory')).toBe(2024)
    })
})

describe('formatDateInput', () => {
    getNowInCalendar.mockReturnValue({
        day: 15,
        month: 7,
        eraYear: 2024,
    })

    it('should remove non-numeric characters', () => {
        expect(formatDateInput('202a')).toBe('202')
        expect(formatDateInput('2021-1b')).toBe('2021-1')
        expect(formatDateInput('2021-12-c')).toBe('2021-12')
    })

    it('should not allow years as 0000', () => {
        expect(formatDateInput('0000')).toBe('2024')
    })

    it('should not allow months outside 1-12', () => {
        expect(formatDateInput('2021-13-01')).toBe('2021-12-01')
        expect(formatDateInput('2021-00-01')).toBe('2021-01-01')
    })

    it('should not allow days outside valid range for months', () => {
        expect(formatDateInput('2021-01-00')).toBe('2021-01-01')
        expect(formatDateInput('2021-02-30')).toBe('2021-02-28')
        expect(formatDateInput('2021-04-31')).toBe('2021-04-30')
    })

    it('should handle partial input gracefully', () => {
        expect(formatDateInput('202')).toBe('202')
        expect(formatDateInput('2021-1')).toBe('2021-1')
        expect(formatDateInput('2021-12')).toBe('2021-12')
        expect(formatDateInput('2021-12-0')).toBe('2021-12-0')
    })

    it('should handle empty input', () => {
        expect(formatDateInput('')).toBe('')
    })

    it('should truncate excess characters', () => {
        expect(formatDateInput('2021-12-015')).toBe('2021-12-01')
        expect(formatDateInput('2021-12-01-Extra')).toBe('2021-12-01')
    })

    it('should correct invalid day ranges on leap years', () => {
        expect(formatDateInput('2020-02-30')).toBe('2020-02-29') // 2020 is a leap year
        expect(formatDateInput('2021-02-29')).toBe('2021-02-28') // 2021 is not a leap year
    })

    it('should allow valid dates', () => {
        expect(formatDateInput('2021-12-01')).toBe('2021-12-01')
        expect(formatDateInput('2004-02-29')).toBe('2004-02-29') // Leap year
    })
})

describe('formatDateOnBlur', () => {
    it('should remove the trailing dash when the length is 5 or 8 and ends with a dash', () => {
        expect(formatDateOnBlur('2021-')).toBe('2021') // Case 5 characters
        expect(formatDateOnBlur('2021-12-')).toBe('2021-12') // Case 8 characters
    })

    it('should pad the 9th character with "0" when the length is 9', () => {
        expect(formatDateOnBlur('2021-12-3')).toBe('2021-12-03') // Pad day
    })

    it('should return the input unchanged for other lengths or conditions', () => {
        expect(formatDateOnBlur('2021')).toBe('2021') // Length < 5
        expect(formatDateOnBlur('2021-12')).toBe('2021-12') // Valid date, no trailing dash
        expect(formatDateOnBlur('2021-12-03')).toBe('2021-12-03') // Properly formatted date
        expect(formatDateOnBlur('')).toBe('') // Empty input
    })
})
