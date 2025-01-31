import { getNowInCalendar } from '@dhis2/multi-calendar-dates'
import {
    getMaxDaysInMonth,
    getMaxMonthsInYear,
    getCurrentYearInCalendar,
    getDefaultDatesInCalendar,
    replaceAt,
    formatDateInput,
    formatDateOnBlur,
    nextCharIsHyphen,
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

describe('replaceAt', () => {
    it('replaces character at given index with cleaned replacement', () => {
        const str1 = 'hello world'
        const str2 = '1'
        const result = replaceAt(str1, 6, str2)
        expect(result).toBe('hello 1orld')
    })

    it('does not modify string if replacement contains only non-digit characters', () => {
        const str1 = 'hello world'
        const str2 = 'X'
        const result = replaceAt(str1, 6, str2)
        expect(result).toBe('hello world')
    })

    it('if index is out of bounds (< 0)', () => {
        const str1 = 'hello world'
        const str2 = '1'
        expect(replaceAt(str1, -1, str2)).toBe('1ello world')
    })

    it('if index is out of bounds (> srt.length)', () => {
        const str1 = 'hello world'
        const str2 = '1'
        expect(replaceAt(str1, 20, str2)).toBe('hello world1')
    })

    it('replaces at the first character when index is 0', () => {
        const str1 = 'hello world'
        const str2 = '1'
        const result = replaceAt(str1, 0, str2)
        expect(result).toBe('1ello world')
    })
})

describe('formatDateInput - Overtyping', () => {
    getNowInCalendar.mockReturnValue({
        day: 15,
        month: 7,
        eraYear: 2024,
    })

    it('should allow replacing a single character in the year', () => {
        expect(
            formatDateInput({ date: '12024', prevDate: '2024', caret: 1 })
        ).toBe('1024')
        expect(
            formatDateInput({ date: '32024', prevDate: '2024', caret: 1 })
        ).toBe('3024')
    })

    it('should allow replacing a single character in the month', () => {
        expect(
            formatDateInput({ date: '2024-087', prevDate: '2024-07', caret: 7 })
        ).toBe('2024-08')
        expect(
            formatDateInput({ date: '2024-132', prevDate: '2024-12', caret: 7 })
        ).toBe('2024-12') // Invalid month
    })

    it('should allow replacing a single character in the day', () => {
        expect(
            formatDateInput({
                date: '2024-07-165',
                prevDate: '2024-07-15',
                caret: 10,
            })
        ).toBe('2024-07-16')
        expect(
            formatDateInput({
                date: '2024-07-321',
                prevDate: '2024-07-31',
                caret: 10,
            })
        ).toBe('2024-07-31') // Invalid day
    })

    it('should not change the date if overtyping occurs on a hyphen', () => {
        expect(
            formatDateInput({
                date: '2024-07--',
                prevDate: '2024-07-',
                caret: 8,
            })
        ).toBe('2024-07-')
    })

    it('should change the next character if overtyping occurs on a hyphen', () => {
        expect(
            formatDateInput({
                date: '20241-01',
                prevDate: '2024-01',
                caret: 5,
            })
        ).toBe('2024-11')
        expect(
            formatDateInput({
                date: '2024-011-01',
                prevDate: '2024-01-01',
                caret: 8,
            })
        ).toBe('2024-01-11')
    })

    it('should correct invalid values after overtyping', () => {
        expect(
            formatDateInput({
                date: '2024-001-15',
                prevDate: '2024-01-15',
                caret: 6,
            })
        ).toBe('2024-01-15') // Month correction
        expect(
            formatDateInput({
                date: '2024-07-001',
                prevDate: '2024-07-01',
                caret: 9,
            })
        ).toBe('2024-07-01') // Day correction
    })

    it('should not apply overtyping when a character is removed', () => {
        expect(
            formatDateInput({ date: '202', prevDate: '2024', caret: 3 })
        ).toBe('202')
        expect(
            formatDateInput({ date: '204-12', prevDate: '2024-12', caret: 2 })
        ).toBe('2024-12')
        expect(
            formatDateInput({ date: '2024-2', prevDate: '2024-12', caret: 5 })
        ).toBe('2024-12')
    })
})

describe('formatDateInput - Date correction', () => {
    getNowInCalendar.mockReturnValue({
        day: 15,
        month: 7,
        eraYear: 2024,
    })

    it('should remove non-numeric characters', () => {
        expect(formatDateInput({ date: '202a', prevDate: '202' })).toBe('202')
        expect(formatDateInput({ date: '2021-1b', prevDate: '2021-1' })).toBe(
            '2021-1'
        )
        expect(
            formatDateInput({ date: '2021-12-c', prevDate: '2021-12-' })
        ).toBe('2021-12')
    })

    it('should not allow years as 0000', () => {
        expect(formatDateInput({ date: '0000', prevDate: '000' })).toBe('2024')
    })

    it('should not allow months outside 1-12', () => {
        expect(
            formatDateInput({ date: '2021-13-01', prevDate: '2021-13-0' })
        ).toBe('2021-12-01')
        expect(
            formatDateInput({ date: '2021-00-01', prevDate: '2021-00-0' })
        ).toBe('2021-01-01')
    })

    it('should not allow days outside valid range for months', () => {
        expect(
            formatDateInput({ date: '2021-01-00', prevDate: '2021-01-0' })
        ).toBe('2021-01-01')
        expect(
            formatDateInput({ date: '2021-02-30', prevDate: '2021-02-3' })
        ).toBe('2021-02-28')
        expect(
            formatDateInput({ date: '2021-04-31', prevDate: '2021-04-3' })
        ).toBe('2021-04-30')
    })

    it('should handle partial input gracefully', () => {
        expect(formatDateInput({ date: '202', prevDate: '20' })).toBe('202')
        expect(formatDateInput({ date: '2021-1', prevDate: '2021-' })).toBe(
            '2021-1'
        )
        expect(formatDateInput({ date: '2021-12', prevDate: '2021-1' })).toBe(
            '2021-12'
        )
        expect(
            formatDateInput({ date: '2021-12-0', prevDate: '2021-12-' })
        ).toBe('2021-12-0')
    })

    it('should handle empty input', () => {
        expect(formatDateInput({ date: '' })).toBe('')
    })

    it('should truncate excess characters', () => {
        expect(
            formatDateInput({ date: '2021-12-015', prevDate: '2021-12-01' })
        ).toBe('2021-12-01')
        expect(
            formatDateInput({
                date: '2021-12-01-Extra',
                prevDate: '2021-12-01-Extr',
            })
        ).toBe('2021-12-01')
    })

    it('should correct invalid day ranges on leap years', () => {
        expect(
            formatDateInput({ date: '2020-02-30', prevDate: '2020-02-3' })
        ).toBe('2020-02-29') // 2020 is a leap year
        expect(
            formatDateInput({ date: '2021-02-29', prevDate: '2021-02-2' })
        ).toBe('2021-02-28') // 2021 is not a leap year
    })

    it('should allow valid dates', () => {
        expect(formatDateInput({ date: '2021-12-01' })).toBe('2021-12-01')
        expect(formatDateInput({ date: '2004-02-29' })).toBe('2004-02-29') // Leap year
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

describe('nextCharIsHyphen', () => {
    it('returns false when any argument is missing', () => {
        expect(nextCharIsHyphen({ date: '', prevDate: '', caret: 0 })).toBe(
            false
        )
        expect(
            nextCharIsHyphen({ date: '2022', prevDate: '2022', caret: 0 })
        ).toBe(false)
        expect(
            nextCharIsHyphen({ date: '', prevDate: '2022-01', caret: 5 })
        ).toBe(false)
    })

    it('returns false if a non-digit character is inserted', () => {
        const result = nextCharIsHyphen({
            date: '2022-0A',
            prevDate: '2022-0',
            caret: 7,
        })
        expect(result).toBe(false)
    })

    it('returns true when a digit is inserted at the hyphen position (position 5 or 8)', () => {
        const result1 = nextCharIsHyphen({
            date: '20220',
            prevDate: '2022',
            caret: 5,
        })
        const result2 = nextCharIsHyphen({
            date: '2022-011',
            prevDate: '2022-01',
            caret: 8,
        })

        expect(result1).toBe(true)
        expect(result2).toBe(true)
    })

    it('returns false if the inserted character is not a digit and caret is at hyphen position', () => {
        const result = nextCharIsHyphen({
            date: '2022A',
            prevDate: '2022',
            caret: 5,
        })
        expect(result).toBe(false)
    })

    it('returns true if the caret is at the hyphen position and next character is a hyphen', () => {
        const result1 = nextCharIsHyphen({
            date: '20220-',
            prevDate: '2022-',
            caret: 5,
        })
        const result2 = nextCharIsHyphen({
            date: '2022-011-',
            prevDate: '2022-01-',
            caret: 8,
        })
        expect(result1).toBe(true)
        expect(result2).toBe(true)
    })

    it('returns true if adding an "early" hyphen', () => {
        const result = nextCharIsHyphen({
            date: '2022-1-',
            prevDate: '2022-1',
            caret: 7,
        })
        expect(result).toBe(true)
    })

    it('returns false if the caret is not at the hyphen position', () => {
        const result = nextCharIsHyphen({
            date: '2022-01',
            prevDate: '2022-0',
            caret: 6,
        })
        expect(result).toBe(false)
    })
})
