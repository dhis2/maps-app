import { getFixedPeriodsOptionsById as getPeriodById } from '@dhis2/analytics';
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

const getYearOffsetFromNow = year => year - new Date(Date.now()).getFullYear();

export const filterFuturePeriods = periods => {
    const now = new Date(Date.now());
    return periods.filter(({ startDate }) => new Date(startDate) < now);
};

export const createPeriods = (periodType, year) => {
    const period = getPeriodById(periodType);
    const offset = getYearOffsetFromNow(year);
    const reversePeriods = true;

    return period ? period.getPeriods({ offset, reversePeriods }) : null;
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
