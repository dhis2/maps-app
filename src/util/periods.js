import { createPeriodGeneratorsForLocale } from 'd2/period/generators';
import { calendar } from 'd3-scale/src/time';
import { timeFormat } from 'd3-time-format';
import {
    timeYear,
    timeMonth,
    timeMonday as timeWeek,
    timeDay,
    timeHour,
    timeMinute,
    timeSecond,
    timeMillisecond,
} from 'd3-time';
import { browserLocale } from './i18n';

export const createPeriods = (locale, periodType, year) => {
    const localePeriodGenerator = createPeriodGeneratorsForLocale(
        browserLocale(locale)
    );

    const periodGenerator =
        localePeriodGenerator[`generate${periodType}PeriodsForYear`] ||
        localePeriodGenerator[`generate${periodType}PeriodsUpToYear`];

    if (!periodGenerator) {
        return null;
    }

    return periodGenerator(year).reverse();
};

// Changed from default time scale to have weeks starting on monday
// https://github.com/d3/d3-scale/blob/master/src/time.js#L133
export const scaleTime = () =>
    calendar(
        timeYear,
        timeMonth,
        timeWeek,
        timeDay,
        timeHour,
        timeMinute,
        timeSecond,
        timeMillisecond,
        timeFormat
    );
