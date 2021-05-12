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

export const createPeriods = (
    locale,
    periodType,
    year,
    startPeriod,
    endPeriod
) => {
    const localePeriodGenerator = createPeriodGeneratorsForLocale(locale);

    const periodGenerator =
        localePeriodGenerator[`generate${periodType}PeriodsForYear`] ||
        localePeriodGenerator[`generate${periodType}PeriodsUpToYear`];

    if (!periodGenerator) {
        return null;
    }

    let periods = periodGenerator(year).reverse();

    if (startPeriod) {
        periods = periods.filter(p => p.id >= startPeriod);
    }

    if (endPeriod) {
        periods = periods.filter(p => p.id <= endPeriod);
    }

    return periods;
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
