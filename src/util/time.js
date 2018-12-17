import i18n from '@dhis2/d2-i18n';

const DEFAULT_LOCALE = 'en';

/**
 * Converts a date string or timestamp to a date object
 * @param {String|Number|Date} date
 * @returns {String}
 */
export const toDate = date => new Date(date);

// Simple check if the date part is correctly formatted
const shortDateRegexp = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Checks if the date format is valid
 * @param {String} dateString
 * @returns {String}
 */
export const isValidDateFormat = dateString =>
    shortDateRegexp.test(dateString.substr(0, 10));

/**
 * Formats a date string or timestamp into format used by DHIS2 and <input> date
 * @param {String|Number|Date} date
 * @returns {String}
 */
export const formatDate = date => {
    const dateObj = toDate(date);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // xxxx-xx-xx
};

/**
 * Simple fallback date format if Intl is not supported
 * @param {String} dateString
 * @returns {String}
 */
const fallbackDateFormat = dateString => dateString.substr(0, 10);

/**
 * Returns true if the Internationalization API is supported
 * @returns {Boolean}
 */
export const hasIntlSupport =
    typeof global.Intl !== 'undefined' && Intl.DateTimeFormat;

/**
 * Formats a date string or timestamp to the default display format: 13 Aug 2018 (en locale)
 * @param {String} dateString
 * @param {String} locale
 * @returns {String}
 */
export const formatLocaleDate = (dateString, locale) =>
    hasIntlSupport
        ? new Intl.DateTimeFormat(locale || i18n.language || DEFAULT_LOCALE, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          }).format(toDate(dateString))
        : fallbackDateFormat(dateString);

/**
 * Formats a date range
 * @param {String|Number} startDate
 * @param {String|Number} endDate
 * @param {String} locale
 * @returns {String}
 */
export const formatStartEndDate = (startDate, endDate, locale) => {
    const loc = locale || i18n.language || DEFAULT_LOCALE;
    return `${formatLocaleDate(startDate, loc)} - ${formatLocaleDate(
        endDate,
        locale
    )}`;
};

/**
 * Checks for errors for start and end date strings or timestamps
 * @param {String} startDate
 * @param {String} endDate
 * @returns {String|null}
 */
export const getStartEndDateError = (startDate, endDate) => {
    if (!isValidDateFormat(startDate)) {
        return i18n.t('Start date is invalid');
    } else if (!isValidDateFormat(endDate)) {
        return i18n.t('End date is invalid');
    } else if (toDate(endDate) < toDate(startDate)) {
        return i18n.t('End date cannot be earlier than start date');
    }
    return null;
};

/**
 * Returns the year of the date, or the current year of no date is passed
 * @param {String|Number|Date} startDate
 * @returns {Number}
 */
export const getYear = date => toDate(date || new Date()).getFullYear();
