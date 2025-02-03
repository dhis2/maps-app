import { getNowInCalendar } from '@dhis2/multi-calendar-dates'
import { Temporal } from '@js-temporal/polyfill' // 13th months in etiopic calendar cannot be returned by getFixedPeriodByDate (@dhis2/multi-calendar-dates)

export const DEFAULT_CALENDAR = 'iso8601'
export const DEFAULT_PLACEHOLDER = 'yyyy-mm-dd'

const JULIAN_CALENDAR_NAME = 'julian'
const NEPALI_CALENDAR_NAME = 'nepali'
const GREGORIAN_CALENDAR_NAME = 'gregory'
const ETHIOPIAN_CALENDAR_NAME = 'ethiopic'
const THAI_CALENDAR_NAME = 'buddhist'

// dhis2CalendarsMap and NEPALI_CALENDAR_DATA cannot be imported from @dhis2/multi-calendar-dates

const dhis2CalendarsMap = {
    iso8601: GREGORIAN_CALENDAR_NAME, // this is not supported by getNowInCalendar
    ethiopian: ETHIOPIAN_CALENDAR_NAME,
    gregorian: GREGORIAN_CALENDAR_NAME,
    julian: GREGORIAN_CALENDAR_NAME, // this is not supported by Temporal
    thai: THAI_CALENDAR_NAME,
}
const NEPALI_CALENDAR_DATA = {
    // Used in @dhis2/multi-calendar-dates and @kbwood/world-calendars
    // First value is used for 1st January calculation (not used here)
    // This data are from http://www.ashesh.com.np
    1970: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1971: [18, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    1972: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1973: [19, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1974: [19, 31, 31, 32, 30, 31, 31, 30, 29, 30, 29, 30, 30],
    1975: [18, 31, 31, 32, 32, 30, 31, 30, 29, 30, 29, 30, 30],
    1976: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1977: [18, 31, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    1978: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1979: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1980: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1981: [18, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1982: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1983: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1984: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1985: [18, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    1986: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1987: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    1988: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    1989: [18, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1990: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1991: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    // These data are from http://nepalicalendar.rat32.com/index.php
    1992: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1993: [18, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    1994: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1995: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    1996: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    1997: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1998: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    1999: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2000: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2001: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2002: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2003: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2004: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2005: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2006: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2007: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2008: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2009: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2010: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2011: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2012: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2013: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2014: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2015: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2016: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2017: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2018: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2019: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2020: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2021: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2022: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2023: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2024: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2025: [18, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2026: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2027: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2028: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2029: [18, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2030: [17, 31, 32, 31, 32, 31, 30, 30, 30, 30, 30, 30, 31],
    2031: [17, 31, 32, 31, 32, 31, 31, 31, 31, 31, 31, 31, 31],
    2032: [17, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32],
    2033: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2034: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2035: [17, 30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2036: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2037: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2038: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2039: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2040: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2041: [18, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2042: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2043: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2044: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2045: [18, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2046: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2047: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2048: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2049: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2050: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2051: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2052: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2053: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2054: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2055: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 29, 30],
    2056: [17, 31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    2057: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2058: [17, 30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2059: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2060: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2061: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2062: [17, 30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    2063: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2064: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2065: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2066: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    2067: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2068: [17, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2069: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2070: [17, 31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    2071: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2072: [17, 31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2073: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2074: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2075: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2076: [16, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    2077: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2078: [17, 31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2079: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2080: [16, 31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    // These data are from http://www.ashesh.com.np/nepali-calendar/
    2081: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2082: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2083: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2084: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2085: [17, 31, 32, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30],
    2086: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2087: [16, 31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    2088: [16, 30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    2089: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2090: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2091: [16, 31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    2092: [16, 31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2093: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2094: [17, 31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    2095: [17, 31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    2096: [17, 30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2097: [17, 31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    2098: [17, 31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 30, 31],
    2099: [17, 31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
    2100: [17, 31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
}

export const getMaxDaysInMonth = (year, month, calendar) => {
    if (calendar === JULIAN_CALENDAR_NAME && year % 4 === 0 && month === 2) {
        return 29
    }
    if (calendar === NEPALI_CALENDAR_NAME) {
        return NEPALI_CALENDAR_DATA[year][month]
    }
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    const date = Temporal.PlainDate.from({
        year: year,
        month: month,
        day: 1,
        calendar: calendarName,
    })

    return date.daysInMonth
}

export const getMaxMonthsInYear = (year, calendar) => {
    if (calendar === NEPALI_CALENDAR_NAME) {
        return NEPALI_CALENDAR_DATA[year].length - 1
    }
    const calendarName = dhis2CalendarsMap[calendar] || calendar

    const date = Temporal.PlainDate.from({
        year: year,
        month: 1,
        day: 1,
        calendar: calendarName,
    })

    return date.monthsInYear
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

export const getCurrentYearInCalendar = (calendar) => {
    const calendarName = dhis2CalendarsMap[calendar] || calendar
    const today = getNowInCalendar(calendarName)
    return today.eraYear
}

export function replaceAt(str, index, replacement) {
    const cleanReplacement = replacement.replace(/\D/g, '')
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

    const numericDate = date.replace(/\D/g, '')

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

    const formattedMonth =
        month === '00' ? 1 : month > maxMonth ? maxMonth : month

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
    const formattedDay =
        day === '00' ? 1 : day > maxDaysInMonth ? maxDaysInMonth : day

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
