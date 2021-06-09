import {
    getFixedPeriodsOptionsById,
    getRelativePeriodsOptionsById,
} from '@dhis2/analytics';
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
import { periodTypes, periodGroups } from '../constants/periods';

const getYearOffsetFromNow = year => year - new Date(Date.now()).getFullYear();

export const getPeriodTypes = (hiddenPeriods = []) =>
    periodTypes().filter(({ group }) => !hiddenPeriods.includes(group));

export const getFixedPeriodsByType = (periodType, year) => {
    const period = getFixedPeriodsOptionsById(periodType);
    const offset = getYearOffsetFromNow(year);
    const reversePeriods = true;

    return period ? period.getPeriods({ offset, reversePeriods }) : null;
};

export const getRelativePeriods = (hiddenPeriods = []) =>
    periodGroups
        .filter(id => !hiddenPeriods.includes(id))
        .map(id => getRelativePeriodsOptionsById(id).getPeriods())
        .flat();

export const isPeriodAvailable = (id, hiddenPeriods) =>
    !!getRelativePeriods(hiddenPeriods).find(p => p.id === id);

// All period names
export const getPeriodNames = () => ({
    ...getPeriodTypes().reduce((obj, { id, name }) => {
        obj[id] = name;
        return obj;
    }, {}),
    ...getRelativePeriods().reduce((obj, { id, name }) => {
        obj[id] = name;
        return obj;
    }, {}),
});

export const filterFuturePeriods = periods => {
    const now = new Date(Date.now());
    return periods.filter(({ startDate }) => new Date(startDate) < now);
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
