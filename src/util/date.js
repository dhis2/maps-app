import { getNowInCalendar } from '@dhis2/multi-calendar-dates'

export const DEFAULT_CALENDAR = 'iso8601'
export const DEFAULT_PLACEHOLDER = 'yyyy-mm-dd'

const GREGORIAN_CALENDAR_NAME = 'gregory'
const ETHIOPIAN_CALENDAR_NAME = 'ethiopic'
const THAI_CALENDAR_NAME = 'buddhist'

// dhis2CalendarsMap cannot be imported from @dhis2/multi-calendar-dates
const dhis2CalendarsMap = {
    iso8601: GREGORIAN_CALENDAR_NAME, // this is not supported by getNowInCalendar
    ethiopian: ETHIOPIAN_CALENDAR_NAME,
    gregorian: GREGORIAN_CALENDAR_NAME,
    julian: GREGORIAN_CALENDAR_NAME, // this is not supported by Temporal
    thai: THAI_CALENDAR_NAME,
}

export const getDefaultDatesInCalendar = (calendar = DEFAULT_CALENDAR) => {
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    const { day, month, eraYear: year } = getNowInCalendar(calendarName)
    const formatDateString = (y, m, d) =>
        `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
    return {
        startDate: formatDateString(year - 1, month, day),
        endDate: formatDateString(year, month, day),
    }
}
