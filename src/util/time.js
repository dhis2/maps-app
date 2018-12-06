import { timeFormat, timeParse } from 'd3-time-format';
import i18n from '@dhis2/d2-i18n';

// The date format uses by the Web API and by <input> date fields
const DATE_FORMAT_SPECIFIER = '%Y-%m-%d';

/**
 * Formats a date object using the above format.
 * @param {Date} date
 * @returns {String}
 */
export const dateFormat = timeFormat(DATE_FORMAT_SPECIFIER);

/**
 * Formats a date string using the above format.
 * @param {String} date
 * @returns {String}
 */
export const formatDate = value => dateFormat(new Date(value));

/**
 * Converts a date string of the the above format to a date object.
 * @param {String} date
 * @returns {Date}
 */
export const parseTime = date => timeParse(DATE_FORMAT_SPECIFIER)(date);

/**
 * Formats a date string to the default display format: 13 Aug 2018 (en locale)
 * @param {String} date
 * @param {String} uiLocale
 * @returns {String}
 */
export const formatDisplayDate = (date, uiLocale = 'en') => {
    if (typeof global.Intl !== 'undefined' && Intl.DateTimeFormat) {
        return new Intl.DateTimeFormat(uiLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(date));
    }

    return date.substr(0, 19).replace('T', ' ');
};

/**
 * Checks for errors for start and end date strings
 * @param {String} startDate
 * @param {String} endDate
 * @returns {String|null}
 */
export const getStartEndDateError = (startDate, endDate) => {
    const start = parseTime(startDate.substring(0, 10)); // Only check date part
    const end = parseTime(endDate.substring(0, 10)); // Only check date part

    if (!start) {
        return i18n.t('Start date is invalid');
    } else if (!end) {
        return i18n.t('End date is invalid');
    } else if (end < start) {
        return i18n.t('End date cannot be earlier than start date');
    }
    return null;
};
