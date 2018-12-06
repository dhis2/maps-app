/**
 *
 * @param {Date} value Javascript date
 * @param {String} uiLocale
 * @returns {String}
 *
 * Copied from data-visualizer-app:
 * https://github.com/dhis2/data-visualizer-app/blob/master/packages/app/src/modules/formatDate.js
 * TODO: Keep functions like this in a shared analytics repo
 */
export const formatDate = (value = '', uiLocale = 'en') => {
    if (typeof global.Intl !== 'undefined' && Intl.DateTimeFormat) {
        return new Intl.DateTimeFormat(uiLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(value));
    }

    return value.substr(0, 19).replace('T', ' ');
};
