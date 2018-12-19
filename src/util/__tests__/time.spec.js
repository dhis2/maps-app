import {
    toDate,
    isValidDateFormat,
    formatDate,
    formatLocaleDate,
    formatStartEndDate,
    getStartEndDateError,
    getYear,
} from '../time';

const validDateString = '2018-12-17T12:00:00';
const invalidDateString = '2018-13-17T12:00:00';
const invalidDateStringFormat = '2018-13-7T12:00:00';
const validTimestamp = 1545044966178;
const invalidTimestamp = 15450221323142342;
const validDate = new Date('2018-12-17T12:00:00');
const invalidDate = new Date('2018-13-17T12:00:00');
const currentYear = new Date().getFullYear();

// https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
const isValidDate = d => d instanceof Date && !isNaN(d.getTime());

describe('time utils', () => {
    it('toDate should return a date object from a valid date string, timestamp or date object', () => {
        expect(isValidDate(toDate(validDateString))).toBeTruthy();
        expect(isValidDate(toDate(invalidDateString))).toBeFalsy();
        expect(isValidDate(toDate(validTimestamp))).toBeTruthy();
        expect(isValidDate(toDate(invalidTimestamp))).toBeFalsy();
        expect(isValidDate(toDate(validDate))).toBeTruthy();
        expect(isValidDate(toDate(invalidDate))).toBeFalsy();
    });

    it('isValidDateFormat should return true if date string is formatted as yyyy-mm-dd', () => {
        expect(isValidDateFormat(validDateString)).toBeTruthy();
        expect(isValidDateFormat(invalidDateString)).toBeTruthy(); // Date is invalid, but format is still valid
        expect(isValidDateFormat(invalidDateStringFormat)).toBeFalsy();
    });

    it('formatDate should return a formatted date string if valid', () => {
        expect(isValidDateFormat(formatDate(validDate))).toBeTruthy();
        expect(isValidDateFormat(formatDate(invalidDate))).toBeFalsy();
    });

    // Node only support a limited set of locales by default:
    // https://stackoverflow.com/questions/49052731/jest-test-intl-datetimeformat
    it('formatLocaleDate should format date string according to locale', () => {
        expect(formatLocaleDate(validDateString)).toEqual('Dec 17, 2018');
        expect(formatLocaleDate(validDateString, 'en')).toEqual('Dec 17, 2018');
    });

    // Node only support a limited set of locales by default:
    // https://stackoverflow.com/questions/49052731/jest-test-intl-datetimeformat
    it('ormatStartEndDate should format date range according to locale', () => {
        expect(formatStartEndDate('2018-12-17', '2018-12-18', 'en')).toEqual(
            'Dec 17, 2018 - Dec 18, 2018'
        );
    });

    it('formatLocaleDate should format date string according to locale', () => {
        expect(getStartEndDateError('2018-12-17', '2018-12-18')).toBeNull();
        expect(getStartEndDateError('2018-12-17', '2018-12-16')).toEqual(
            'End date cannot be earlier than start date'
        );
        expect(getStartEndDateError('2018-12-7', '2018-12-16')).toEqual(
            'Start date is invalid'
        );
        expect(getStartEndDateError('2018-12-17', '2018-2-16')).toEqual(
            'End date is invalid'
        );
    });

    it('getYear should return the year from a date, or the current year', () => {
        expect(getYear()).toEqual(currentYear);
        expect(getYear(validDateString)).toEqual(2018);
        expect(getYear(validTimestamp)).toEqual(2018);
        expect(getYear(validDate)).toEqual(2018);
    });
});
