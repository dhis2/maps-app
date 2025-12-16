import i18n from '@dhis2/d2-i18n'

const DEFAULT_LOCALE = 'en'

// BCP 47 locale format
const dateLocale = (locale) =>
    locale && locale.includes('_') ? locale.replace('_', '-') : locale

/**
 * Trims the time part from an ISO date-time string, returning only the date (YYYY-MM-DD).
 * Assumes input is always a valid ISO date or date-time string (e.g., 'YYYY-MM-DD' or 'YYYY-MM-DDThh:mm:ss').
 * @param {String} dateTime
 * @returns {String}
 */
export const trimTime = (dateTime) => dateTime.slice(0, 10)

/**
 * Converts a date string or timestamp to a date object
 * @param {String|Number|Array|Date} date
 * @returns {String}
 */
const toDate = (date) => {
    if (Array.isArray(date)) {
        return new Date(date[0], date[1], date[2])
    }
    return new Date(date)
}

// Simple check if the date part is correctly formatted
const shortDateRegexp = /^\d{4}-\d{2}-\d{2}$/

/**
 * Checks if the date format is valid
 * @param {String} dateString
 * @returns {String}
 */
const isValidDateFormat = (dateString) =>
    dateString && shortDateRegexp.test(dateString.substr(0, 10))

/**
 * Formats a date string, timestamp or date array into format used by DHIS2 and <input> date
 * @param {String|Number|Array|Date} date
 * @returns {String}
 */
export const formatDate = (date) => {
    const dateObj = toDate(date)
    const year = dateObj.getFullYear()
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
    const day = ('0' + dateObj.getDate()).slice(-2)
    return `${year}-${month}-${day}` // xxxx-xx-xx
}

/**
 * Simple fallback date format if Intl is not supported
 * @param {String} dateString
 * @returns {String}
 */
const fallbackDateFormat = (dateString) => dateString.substr(0, 10)

/**
 * Returns true if the Internationalization API is supported
 * @returns {Boolean}
 */
const hasIntlSupport = typeof window.Intl !== 'undefined' && Intl.DateTimeFormat

/**
 * Formats a date string or timestamp to the default display format: 13 Aug 2018 (en locale)
 * @param {String} dateString
 * @param {String} locale
 * @param {Boolean} showYear
 * @returns {String}
 */
export const formatLocaleDate = (dateString, locale, showYear = true) =>
    hasIntlSupport
        ? new Intl.DateTimeFormat(
              dateLocale(locale || i18n.language || DEFAULT_LOCALE),
              {
                  year: showYear ? 'numeric' : undefined,
                  month: 'short',
                  day: 'numeric',
              }
          ).format(toDate(dateString))
        : fallbackDateFormat(dateString)

/**
 * Formats a date range
 * @param {String|Array|Number} startDate
 * @param {String|Array|Number} endDate
 * @param {String} locale
 * @param {Boolean} showYear
 * @returns {String}
 */
//eslint-disable-next-line max-params
export const formatStartEndDate = (startDate, endDate, locale, showYear) => {
    const loc = locale || i18n.language || DEFAULT_LOCALE
    return `${formatLocaleDate(startDate, loc, showYear)} - ${formatLocaleDate(
        endDate,
        loc,
        showYear
    )}`
}

/**
 * @param {String} dateString
 * @returns {Array}
 */
export const getDateArray = (dateString) => {
    const year = parseInt(dateString.substring(0, 4))
    const month = parseInt(dateString.substring(5, 7)) - 1
    const day = parseInt(dateString.substring(8, 10))
    return [year, month, day]
}

/**
 * Checks for errors for start and end date strings or timestamps
 * @param {String} startDateStr
 * @param {String} endDateStr
 * @returns {String|null}
 */
export const getStartEndDateError = (startDateStr, endDateStr) => {
    if (!isValidDateFormat(startDateStr)) {
        return i18n.t('Start date is invalid')
    } else if (!isValidDateFormat(endDateStr)) {
        return i18n.t('End date is invalid')
    }

    const startDateArr = getDateArray(startDateStr)
    const endDateArr = getDateArray(endDateStr)

    if (toDate(endDateArr) < toDate(startDateArr)) {
        return i18n.t('End date cannot be earlier than start date')
    }
    return null
}

/**
 * Returns the year of the date, or the current year of no date is passed
 * @param {String|Number|Array|Date} startDate
 * @returns {Number}
 */
export const getYear = (date) => toDate(date || new Date()).getFullYear()
