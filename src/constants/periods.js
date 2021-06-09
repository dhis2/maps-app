import i18n from '@dhis2/d2-i18n';
import {
    DAILY,
    WEEKLY,
    WEEKLYWED,
    WEEKLYTHU,
    WEEKLYSAT,
    WEEKLYSUN,
    BIWEEKLY,
    MONTHLY,
    BIMONTHLY,
    QUARTERLY,
    SIXMONTHLY,
    SIXMONTHLYAPR,
    YEARLY,
    FINANCIAL,
    FYNOV,
    FYOCT,
    FYJUL,
    FYAPR,
} from '@dhis2/analytics';

/*
const periodGroups = [
    DAILY,
    WEEKLY,
    BIWEEKLY,
    MONTHLY,
    BIMONTHLY,
    QUARTERLY,
    SIXMONTHLY,
    YEARLY,
    FINANCIAL,
];
*/

export const TODAY = 'TODAY';
export const YESTERDAY = 'YESTERDAY';
export const LAST_3_DAYS = 'LAST_3_DAYS';
export const LAST_7_DAYS = 'LAST_7_DAYS';
export const LAST_14_DAYS = 'LAST_14_DAYS';
export const LAST_30_DAYS = 'LAST_30_DAYS';
export const LAST_60_DAYS = 'LAST_60_DAYS';
export const LAST_90_DAYS = 'LAST_90_DAYS';
export const LAST_180_DAYS = 'LAST_180_DAYS';
export const THIS_WEEK = 'THIS_WEEK';
export const LAST_WEEK = 'LAST_WEEK';
export const LAST_4_WEEKS = 'LAST_4_WEEKS';
export const LAST_12_WEEKS = 'LAST_12_WEEKS';
export const LAST_52_WEEKS = 'LAST_52_WEEKS';
export const WEEKS_THIS_YEAR = 'WEEKS_THIS_YEAR';
export const THIS_BIWEEK = 'THIS_BIWEEK';
export const LAST_BIWEEK = 'LAST_BIWEEK';
export const LAST_4_BIWEEKS = 'LAST_4_BIWEEKS';
export const THIS_MONTH = 'THIS_MONTH';
export const LAST_MONTH = 'LAST_MONTH';
export const LAST_3_MONTHS = 'LAST_3_MONTHS';
export const LAST_6_MONTHS = 'LAST_6_MONTHS';
export const LAST_12_MONTHS = 'LAST_12_MONTHS';
export const MONTHS_THIS_YEAR = 'MONTHS_THIS_YEAR';
export const THIS_BIMONTH = 'THIS_BIMONTH';
export const LAST_BIMONTH = 'LAST_BIMONTH';
export const LAST_6_BIMONTHS = 'LAST_6_BIMONTHS';
export const BIMONTHS_THIS_YEAR = 'BIMONTHS_THIS_YEAR';
export const THIS_QUARTER = 'THIS_QUARTER';
export const LAST_QUARTER = 'LAST_QUARTER';
export const LAST_4_QUARTERS = 'LAST_4_QUARTERS';
export const QUARTERS_THIS_YEAR = 'QUARTERS_THIS_YEAR';
export const THIS_SIX_MONTH = 'THIS_SIX_MONTH';
export const LAST_SIX_MONTH = 'LAST_SIX_MONTH';
export const LAST_2_SIXMONTHS = 'LAST_2_SIXMONTHS';
export const THIS_YEAR = 'THIS_YEAR';
export const LAST_YEAR = 'LAST_YEAR';
export const LAST_5_YEARS = 'LAST_5_YEARS';
export const LAST_10_YEARS = 'LAST_10_YEARS';
export const THIS_FINANCIAL_YEAR = 'THIS_FINANCIAL_YEAR';
export const LAST_FINANCIAL_YEAR = 'LAST_FINANCIAL_YEAR';
export const LAST_5_FINANCIAL_YEARS = 'LAST_5_FINANCIAL_YEARS';

export const getPeriodTypes = () => [
    {
        id: 'relativePeriods',
        name: i18n.t('Relative'),
    },
    {
        id: DAILY,
        name: i18n.t('Daily'),
        group: DAILY,
    },
    {
        id: WEEKLY,
        name: i18n.t('Weekly'),
        group: WEEKLY,
    },
    {
        id: WEEKLYWED,
        name: i18n.t('Weekly (Start Wednesday)'),
        group: WEEKLY,
    },
    {
        id: WEEKLYTHU,
        name: i18n.t('Weekly (Start Thursday)'),
        group: WEEKLY,
    },
    {
        id: WEEKLYSAT,
        name: i18n.t('Weekly (Start Saturday)'),
        group: WEEKLY,
    },
    {
        id: WEEKLYSUN,
        name: i18n.t('Weekly (Start Sunday)'),
        group: WEEKLY,
    },
    {
        id: BIWEEKLY,
        name: i18n.t('Bi-weekly'),
        group: BIWEEKLY,
    },
    {
        id: MONTHLY,
        name: i18n.t('Monthly'),
        group: MONTHLY,
    },
    {
        id: BIMONTHLY,
        name: i18n.t('Bi-monthly'),
        group: BIMONTHLY,
    },
    {
        id: QUARTERLY,
        name: i18n.t('Quarterly'),
        group: QUARTERLY,
    },
    {
        id: SIXMONTHLY,
        name: i18n.t('Six-monthly'),
        group: SIXMONTHLY,
    },
    {
        id: SIXMONTHLYAPR,
        name: i18n.t('Six-monthly April'),
        group: SIXMONTHLY,
    },
    {
        id: YEARLY,
        name: i18n.t('Yearly'),
        group: YEARLY,
    },
    {
        id: FYNOV,
        name: i18n.t('Financial year (Start November)'),
        group: FINANCIAL,
    },
    {
        id: FYOCT,
        name: i18n.t('Financial year (Start October)'),
        group: FINANCIAL,
    },
    {
        id: FYJUL,
        name: i18n.t('Financial year (Start July)'),
        group: FINANCIAL,
    },
    {
        id: FYAPR,
        name: i18n.t('Financial year (Start April)'),
        group: FINANCIAL,
    },
    {
        id: 'StartEndDates',
        name: i18n.t('Start/end dates'),
    },
];

export const getRelativePeriods = () => [
    {
        id: TODAY,
        name: i18n.t('Today'),
        group: 'DAILY',
    },
    {
        id: 'YESTERDAY',
        name: i18n.t('Yesterday'),
        group: 'DAILY',
    },
    {
        id: 'LAST_3_DAYS',
        name: i18n.t('Last 3 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_7_DAYS',
        name: i18n.t('Last 7 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_14_DAYS',
        name: i18n.t('Last 14 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_30_DAYS',
        name: i18n.t('Last 30 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_60_DAYS',
        name: i18n.t('Last 60 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_90_DAYS',
        name: i18n.t('Last 90 days'),
        group: 'DAILY',
    },
    {
        id: 'LAST_180_DAYS',
        name: i18n.t('Last 180 days'),
        group: 'DAILY',
    },
    {
        id: 'THIS_WEEK',
        name: i18n.t('This week'),
        group: 'WEEKLY',
    },
    {
        id: 'LAST_WEEK',
        name: i18n.t('Last week'),
        group: 'WEEKLY',
    },
    {
        id: 'LAST_4_WEEKS',
        name: i18n.t('Last 4 weeks'),
        group: 'WEEKLY',
    },
    {
        id: 'LAST_12_WEEKS',
        name: i18n.t('Last 12 weeks'),
        group: 'WEEKLY',
    },
    {
        id: 'LAST_52_WEEKS',
        name: i18n.t('Last 52 weeks'),
        group: 'WEEKLY',
    },
    {
        id: 'WEEKS_THIS_YEAR',
        name: i18n.t('Weeks this year'),
        group: 'WEEKLY',
    },
    {
        id: 'THIS_BIWEEK',
        name: i18n.t('This bi-week'),
        group: 'BIWEEKLY',
    },
    {
        id: 'LAST_BIWEEK',
        name: i18n.t('Last bi-week'),
        group: 'BIWEEKLY',
    },
    {
        id: 'LAST_4_BIWEEKS',
        name: i18n.t('Last 4 bi-weeks'),
        group: 'BIWEEKLY',
    },
    {
        id: 'THIS_MONTH',
        name: i18n.t('This month'),
        group: 'MONTHLY',
    },
    {
        id: 'LAST_MONTH',
        name: i18n.t('Last month'),
        group: 'MONTHLY',
    },
    {
        id: 'LAST_3_MONTHS',
        name: i18n.t('Last 3 months'),
        group: 'MONTHLY',
    },
    {
        id: 'LAST_6_MONTHS',
        name: i18n.t('Last 6 months'),
        group: 'MONTHLY',
    },
    {
        id: 'LAST_12_MONTHS',
        name: i18n.t('Last 12 months'),
        group: 'MONTHLY',
    },
    {
        id: 'MONTHS_THIS_YEAR',
        name: i18n.t('Months this year'),
        group: 'MONTHLY',
    },
    {
        id: 'THIS_BIMONTH',
        name: i18n.t('This bi-month'),
        group: 'BIMONTHLY',
    },
    {
        id: 'LAST_BIMONTH',
        name: i18n.t('Last bi-month'),
        group: 'BIMONTHLY',
    },
    {
        id: 'LAST_6_BIMONTHS',
        name: i18n.t('Last 6 bi-months'),
        group: 'BIMONTHLY',
    },
    {
        id: 'BIMONTHS_THIS_YEAR',
        name: i18n.t('Bi-months this year'),
        group: 'BIMONTHLY',
    },
    {
        id: 'THIS_QUARTER',
        name: i18n.t('This quarter'),
        group: 'QUARTERLY',
    },
    {
        id: 'LAST_QUARTER',
        name: i18n.t('Last quarter'),
        group: 'QUARTERLY',
    },
    {
        id: 'LAST_4_QUARTERS',
        name: i18n.t('Last 4 quarters'),
        group: 'QUARTERLY',
    },
    {
        id: 'QUARTERS_THIS_YEAR',
        name: i18n.t('Quarters this year'),
        group: 'QUARTERLY',
    },
    {
        id: 'THIS_SIX_MONTH',
        name: i18n.t('This six-month'),
        group: 'SIXMONTHLY',
    },
    {
        id: 'LAST_SIX_MONTH',
        name: i18n.t('Last six-month'),
        group: 'SIXMONTHLY',
    },
    {
        id: 'LAST_2_SIXMONTHS',
        name: i18n.t('Last 2 six-months'),
        group: 'SIXMONTHLY',
    },
    {
        id: 'THIS_YEAR',
        name: i18n.t('This year'),
        group: 'YEARLY',
    },
    {
        id: 'LAST_YEAR',
        name: i18n.t('Last year'),
        group: 'YEARLY',
    },
    {
        id: 'LAST_5_YEARS',
        name: i18n.t('Last 5 years'),
        group: 'YEARLY',
    },
    {
        id: 'LAST_10_YEARS',
        name: i18n.t('Last 10 years'),
        group: 'YEARLY',
    },
    {
        id: 'THIS_FINANCIAL_YEAR',
        name: i18n.t('This financial year'),
        group: 'YEARLY',
    },
    {
        id: 'LAST_FINANCIAL_YEAR',
        name: i18n.t('Last financial year'),
        group: 'YEARLY',
    },
    {
        id: 'LAST_5_FINANCIAL_YEARS',
        name: i18n.t('Last 5 financial years'),
        group: 'YEARLY',
    },
];

// Periods that will only produce a single map (not for timeline/split view)
export const singleMapPeriods = [
    TODAY,
    YESTERDAY,
    THIS_WEEK,
    LAST_WEEK,
    THIS_BIWEEK,
    LAST_BIWEEK,
    THIS_MONTH,
    LAST_MONTH,
    THIS_BIMONTH,
    LAST_BIMONTH,
    THIS_QUARTER,
    LAST_QUARTER,
    THIS_YEAR,
    LAST_YEAR,
    THIS_FINANCIAL_YEAR,
    LAST_FINANCIAL_YEAR,
];

// Periods not supported for split view (maximum 12 maps)
export const invalidSplitViewPeriods = [
    LAST_14_DAYS,
    LAST_30_DAYS,
    LAST_60_DAYS,
    LAST_90_DAYS,
    LAST_180_DAYS,
    LAST_52_WEEKS,
    WEEKS_THIS_YEAR,
];

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
