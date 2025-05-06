import {
    formatDate,
    formatLocaleDate,
    formatStartEndDate,
    getStartEndDateError,
    getYear,
    getDateArray,
    trimTime,
} from '../time.js'

const validDateString = '2018-12-17T12:00:00'
const invalidDateString = '2018-13-17T12:00:00'
const validTimestamp = 1545044966178
const invalidTimestamp = 15450221323142342
const validDateArray = [2018, 11, 17]
const invalidDateArray = [2018, 11, 'a']
const validDate = new Date('2018-12-17T12:00:00')
const currentYear = new Date().getFullYear()

// https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
const isValidDateString = (str) => {
    const d = new Date(str)
    return d instanceof Date && !isNaN(d.getTime())
}

describe('time utils', () => {
    it('formatDate should return a formatted date string if valid', () => {
        expect(isValidDateString(formatDate(validDateString))).toBeTruthy()
        expect(isValidDateString(formatDate(invalidDateString))).toBeFalsy()
        expect(isValidDateString(formatDate(validTimestamp))).toBeTruthy()
        expect(isValidDateString(formatDate(invalidTimestamp))).toBeFalsy()
        expect(isValidDateString(formatDate(validDateArray))).toBeTruthy()
        expect(isValidDateString(formatDate(invalidDateArray))).toBeFalsy()
    })

    // Node only support a limited set of locales by default:
    // https://stackoverflow.com/questions/49052731/jest-test-intl-datetimeformat
    it('formatLocaleDate should format date string according to locale', () => {
        expect(formatLocaleDate(validDateString)).toEqual('Dec 17, 2018')
        expect(formatLocaleDate(validDateString, 'en')).toEqual('Dec 17, 2018')
    })

    // Node only support a limited set of locales by default:
    // https://stackoverflow.com/questions/49052731/jest-test-intl-datetimeformat
    it('formatStartEndDate should format date range according to locale', () => {
        expect(
            formatStartEndDate([2018, 11, 17], [2018, 11, 18], 'en')
        ).toEqual('Dec 17, 2018 - Dec 18, 2018')

        expect(
            formatStartEndDate(
                '2018-12-17T12:00:00',
                '2018-12-18T12:00:00',
                'en'
            )
        ).toEqual('Dec 17, 2018 - Dec 18, 2018')
    })

    it('getStartEndDateError should report errors correctly', () => {
        expect(getStartEndDateError('2018-12-17', '2018-12-18')).toBeNull()
        expect(getStartEndDateError('2018-12-17', '2018-12-16')).toEqual(
            'End date cannot be earlier than start date'
        )
        expect(getStartEndDateError('2018-12-7', '2018-12-16')).toEqual(
            'Start date is invalid'
        )
        expect(getStartEndDateError('2018-12-17', '2018-2-16')).toEqual(
            'End date is invalid'
        )
    })

    it('getYear should return the year from a date, or the current year', () => {
        expect(getYear()).toEqual(currentYear)
        expect(getYear(validDateString)).toEqual(2018)
        expect(getYear(validTimestamp)).toEqual(2018)
        expect(getYear(validDate)).toEqual(2018)
    })

    it('getDateArray returns array from date string', () => {
        expect(getDateArray('2018-12-17')).toEqual([2018, 11, 17])
    })

    it('trimTime should return the date part from an ISO date-time string', () => {
        expect(trimTime('2025-04-30T15:30:45')).toBe('2025-04-30')
        expect(trimTime('2025-04-30T15:30:45.123Z')).toBe('2025-04-30')
        expect(trimTime('2020-01-01')).toBe('2020-01-01')
    })
})
