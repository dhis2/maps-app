import {
    addToCalendarDate,
    formatCalendarDate,
    getDaysInMonth,
    getNowInCalendar,
} from '@dhis2/multi-calendar-dates'

export const DEFAULT_CALENDAR = 'iso8601'
export const DEFAULT_PLACEHOLDER = 'yyyy-mm-dd'
export const TIME_PLACEHOLDER = 'hh:mm'

const JULIAN_CALENDAR_NAME = 'julian'
const NEPALI_CALENDAR_NAME = 'nepali'
const GREGORIAN_CALENDAR_NAME = 'gregory'
const ETHIOPIAN_CALENDAR_NAME = 'ethiopic'
const THAI_CALENDAR_NAME = 'buddhist'

const THIRTEEN_MONTH_CALENDARS = new Set(['coptic', ETHIOPIAN_CALENDAR_NAME])

// dhis2CalendarsMap cannot be imported from @dhis2/multi-calendar-dates

const dhis2CalendarsMap = {
    iso8601: GREGORIAN_CALENDAR_NAME, // this is not supported by getNowInCalendar
    ethiopian: ETHIOPIAN_CALENDAR_NAME,
    gregorian: GREGORIAN_CALENDAR_NAME,
    julian: GREGORIAN_CALENDAR_NAME, // this is not supported by multi-calendar-dates
    thai: THAI_CALENDAR_NAME,
}

// @dhis2/multi-calendar-dates only supports these Nepali years
const NEPALI_MIN_YEAR = 1970
const NEPALI_MAX_YEAR = 2100

const assertNepaliYearInRange = (year) => {
    if (year < NEPALI_MIN_YEAR || year > NEPALI_MAX_YEAR) {
        throw new Error(
            `Nepali year ${year} is out of range (${NEPALI_MIN_YEAR}-${NEPALI_MAX_YEAR})`
        )
    }
}

export const getMaxDaysInMonth = (year, month, calendar) => {
    // multi-calendar-dates has no julian calendar, so the app treats it as
    // gregory, which has no 29 February in century years like 1900
    if (calendar === JULIAN_CALENDAR_NAME && year % 4 === 0 && month === 2) {
        return 29
    }
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    return getDaysInMonth({ year, month }, calendarName)
}

export const getMaxMonthsInYear = (year, calendar) => {
    if (calendar === NEPALI_CALENDAR_NAME) {
        assertNepaliYearInRange(year)
    }
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    return THIRTEEN_MONTH_CALENDARS.has(calendarName) ? 13 : 12
}

export const getDefaultDatesInCalendar = (calendar = DEFAULT_CALENDAR) => {
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    const now = getNowInCalendar(calendarName)
    const oneYearAgo = addToCalendarDate(now, { years: -1 }, calendarName)
    return {
        startDate: formatCalendarDate(oneYearAgo),
        endDate: formatCalendarDate(now),
    }
}

export const getCurrentYearInCalendar = (calendar) => {
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    const today = getNowInCalendar(calendarName)
    // eraYear is undefined for calendars without eras (e.g. islamic)
    return today.eraYear ?? today.year
}

export function replaceAt(str, index, replacement) {
    const cleanReplacement = replacement.replaceAll(/\D/g, '')
    if (index >= str.length) {
        return str + cleanReplacement
    }
    if (index < 0) {
        index = 0
    }
    return cleanReplacement
        ? str.slice(0, index) + cleanReplacement + str.slice(index + 1)
        : str
}

export const formatDateInput = ({
    date,
    prevDate,
    caret,
    calendar = DEFAULT_CALENDAR,
}) => {
    if (!date) {
        return ''
    }

    if (prevDate && date.length > caret) {
        if (date.length <= prevDate.length) {
            date = prevDate
        } else if (date[caret] === '-') {
            date = replaceAt(prevDate, caret, date[caret - 1])
        } else {
            date = replaceAt(prevDate, caret - 1, date[caret - 1])
        }
    }

    if (date.length === 7 && date[6] === '-') {
        date = date.slice(0, -2) + '0' + date.slice(-2)
    }

    let finalHyphen = ''
    if (
        (date.length === 5 && date[4] === '-') ||
        (date.length === 6 && date[4] === '-' && date[5] === '-') ||
        (date.length === 8 && date[7] === '-') ||
        (date.length === 9 && date[7] === '-' && date[8] === '-')
    ) {
        finalHyphen = '-'
    }

    const numericDate = date.replaceAll(/\D/g, '')

    const year = numericDate.slice(0, 4)
    const month = numericDate.slice(4, 6)
    const day = numericDate.slice(6, 8)

    if (numericDate.length < 4) {
        return numericDate
    }

    const formattedYear =
        year === '0000' ? getCurrentYearInCalendar(calendar) : year

    if (numericDate.length === 4) {
        return `${formattedYear}${finalHyphen}`
    }

    if (numericDate.length < 6) {
        return `${formattedYear}-${month}`
    }

    const maxMonth = getMaxMonthsInYear(year, calendar)

    let formattedMonth
    if (month === '00') {
        formattedMonth = 1
    } else {
        formattedMonth = Math.min(month, maxMonth)
    }

    if (numericDate.length === 6) {
        return `${formattedYear}-${formattedMonth
            .toString()
            .padStart(2, '0')}${finalHyphen}`
    }

    if (numericDate.length < 8) {
        return `${formattedYear}-${formattedMonth
            .toString()
            .padStart(2, '0')}-${day}`
    }

    const maxDaysInMonth = getMaxDaysInMonth(
        formattedYear,
        formattedMonth,
        calendar
    )
    let formattedDay
    if (day === '00') {
        formattedDay = 1
    } else {
        formattedDay = Math.min(day, maxDaysInMonth)
    }

    return `${formattedYear}-${formattedMonth
        .toString()
        .padStart(2, '0')}-${formattedDay.toString().padStart(2, '0')}`
}

export const formatDateOnBlur = (date) => {
    if (
        (date.length === 5 && date[4] === '-') ||
        (date.length === 8 && date[7] === '-')
    ) {
        return date.slice(0, -1)
    } else if (date?.length === 9) {
        return date.slice(0, -1) + '0' + date.slice(-1)
    } else {
        return date
    }
}

const capTimePart = (digits, max) =>
    digits.length === 2
        ? String(Math.min(Number(digits), max)).padStart(2, '0')
        : digits

const splitTime = (time) => {
    const [hour, ...rest] = time.split(':')
    if (rest.length > 0) {
        return {
            hour: hour.slice(0, 2),
            minute: rest.join('').slice(0, 2),
            hasColon: true,
        }
    }
    // A first digit above 2 can only be a one-digit hour
    const hourLength = Number(hour[0]) > 2 ? 1 : 2
    const minute = hour.slice(hourLength, hourLength + 2)
    return { hour: hour.slice(0, hourLength), minute, hasColon: minute !== '' }
}

// Times are typed as HH:MM (24-hour): digits only, hour and minute capped like months and days
export const formatTimeInput = (time) => {
    const typed = time?.replaceAll(/[^\d:]/g, '')
    if (!typed) {
        return ''
    }
    const { hour, minute, hasColon } = splitTime(typed)
    const cappedHour = capTimePart(hour, 23)
    return hasColon ? `${cappedHour}:${capTimePart(minute, 59)}` : cappedHour
}

export const formatTimeOnBlur = (time) => {
    const match = /^(\d{1,2}):?(\d{0,2})$/.exec(time ?? '')
    if (!match) {
        return time
    }
    const [, hour, minute] = match
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

export const nextCharIsAutoHyphen = ({ date, prevDate, caret }) => {
    if (!date || !prevDate || !caret) {
        return false
    }
    const isInsertingNewChar = date.length === prevDate.length + 1
    const insertedCharIsDigit = /\d/.test(date[caret - 1] || '')
    const insertedCharIsHyphen = date[caret - 1] === '-'
    const atHyphenPosition = caret === 5 || caret === 8
    const atEarlyHyphenPosition = caret === 7 && date.length === 7

    return (
        isInsertingNewChar &&
        ((insertedCharIsDigit && atHyphenPosition) ||
            (insertedCharIsHyphen && atEarlyHyphenPosition))
    )
}

export const nextCharIsManualHyphen = ({ date, prevDate, caret }) => {
    if (!date || !prevDate || !caret) {
        return false
    }
    const atHyphenPosition = caret === 5 || caret === 8
    const insertedCharIsHyphen = date[caret - 1] === '-'

    return atHyphenPosition && insertedCharIsHyphen
}

const getCaretAfterTyping = (dateInfo) => {
    const { date, caret } = dateInfo
    if (nextCharIsAutoHyphen(dateInfo)) {
        return caret + 1
    }
    if (nextCharIsManualHyphen(dateInfo)) {
        return caret
    }
    return /\D/.test(date?.[caret - 1] || '') ? caret - 1 : caret
}

// A typed date formatted as yyyy-mm-dd, and where the caret goes in it
export const typeDate = ({ date, prevDate, caret }) => {
    const dateInfo = { date, prevDate, caret }
    return {
        date: formatDateInput(dateInfo),
        caret: getCaretAfterTyping(dateInfo),
    }
}
