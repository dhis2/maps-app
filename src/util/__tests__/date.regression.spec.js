// Regression snapshots for the app's direct usage of @dhis2/multi-calendar-dates
// (and @js-temporal/polyfill) in src/util/date.js. "Now" is pinned so the
// snapshots are stable. Added to verify the multi-calendar-dates 3.x upgrade.
import {
    getCurrentYearInCalendar,
    getDefaultDatesInCalendar,
    getMaxDaysInMonth,
    getMaxMonthsInYear,
    formatDateInput,
} from '../date.js'

const run = (fn) => {
    try {
        return { value: fn() }
    } catch (error) {
        return { error: error.message }
    }
}

beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15T10:30:00Z'))
})
afterAll(() => jest.useRealTimers())

// DHIS2 calendar ids as the app receives them from system settings
const CALENDARS = [
    { calendar: 'iso8601', year: 2024 },
    { calendar: 'gregorian', year: 2024 },
    { calendar: 'ethiopian', year: 2016 },
    { calendar: 'nepali', year: 2081 },
    { calendar: 'islamic', year: 1445 },
]

describe.each(CALENDARS)('$calendar calendar', ({ calendar, year }) => {
    it('getDefaultDatesInCalendar', () => {
        expect(run(() => getDefaultDatesInCalendar(calendar))).toMatchSnapshot()
    })

    it('getCurrentYearInCalendar', () => {
        expect(run(() => getCurrentYearInCalendar(calendar))).toMatchSnapshot()
    })

    it('formatDateInput fills in the current year for 0000', () => {
        expect(
            run(() => formatDateInput({ date: '0000', calendar }))
        ).toMatchSnapshot()
    })

    it('getMaxMonthsInYear', () => {
        expect(run(() => getMaxMonthsInYear(year, calendar))).toMatchSnapshot()
    })

    it('getMaxDaysInMonth for every month', () => {
        expect(
            run(() =>
                Array.from({ length: 13 }, (_, i) =>
                    run(() => getMaxDaysInMonth(year, i + 1, calendar))
                )
            )
        ).toMatchSnapshot()
    })

    it('formatDateInput clamps a full date', () => {
        expect(
            run(() => formatDateInput({ date: `${year}-12-35`, calendar }))
        ).toMatchSnapshot()
    })
})
