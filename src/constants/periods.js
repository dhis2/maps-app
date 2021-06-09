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
    FYNOV,
    FYOCT,
    FYJUL,
    FYAPR,
} from '@dhis2/analytics';

export const getPeriodTypes = () => [
    {
        id: 'relativePeriods',
        name: i18n.t('Relative'),
    },
    {
        id: DAILY,
        name: i18n.t('Daily'),
        type: 'DAILY',
    },
    {
        id: WEEKLY,
        name: i18n.t('Weekly'),
        type: 'WEEKLY',
    },
    {
        id: WEEKLYWED,
        name: i18n.t('Weekly (Start Wednesday)'),
        type: 'WEEKLY',
    },
    {
        id: WEEKLYTHU,
        name: i18n.t('Weekly (Start Thursday)'),
        type: 'WEEKLY',
    },
    {
        id: WEEKLYSAT,
        name: i18n.t('Weekly (Start Saturday)'),
        type: 'WEEKLY',
    },
    {
        id: WEEKLYSUN,
        name: i18n.t('Weekly (Start Sunday)'),
        type: 'WEEKLY',
    },
    {
        id: BIWEEKLY,
        name: i18n.t('Bi-weekly'),
        type: 'BIWEEKLY',
    },
    {
        id: MONTHLY,
        name: i18n.t('Monthly'),
        type: 'MONTHLY',
    },
    {
        id: BIMONTHLY,
        name: i18n.t('Bi-monthly'),
        type: 'BIMONTHLY',
    },
    {
        id: QUARTERLY,
        name: i18n.t('Quarterly'),
        type: 'QUARTERLY',
    },
    {
        id: SIXMONTHLY,
        name: i18n.t('Six-monthly'),
        type: 'SIXMONTHLY',
    },
    {
        id: SIXMONTHLYAPR,
        name: i18n.t('Six-monthly April'),
        type: 'SIXMONTHLY',
    },
    {
        id: YEARLY,
        name: i18n.t('Yearly'),
        type: 'YEARLY',
    },
    {
        id: FYNOV,
        name: i18n.t('Financial year (Start November)'),
        type: 'YEARLY',
    },
    {
        id: FYOCT,
        name: i18n.t('Financial year (Start October)'),
        type: 'YEARLY',
    },
    {
        id: FYJUL,
        name: i18n.t('Financial year (Start July)'),
        type: 'YEARLY',
    },
    {
        id: FYAPR,
        name: i18n.t('Financial year (Start April)'),
        type: 'YEARLY',
    },
    {
        id: 'StartEndDates',
        name: i18n.t('Start/end dates'),
    },
];

export const getRelativePeriods = () => [
    {
        id: 'TODAY',
        name: i18n.t('Today'),
        type: 'DAILY',
    },
    {
        id: 'YESTERDAY',
        name: i18n.t('Yesterday'),
        type: 'DAILY',
    },
    {
        id: 'LAST_3_DAYS',
        name: i18n.t('Last 3 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_7_DAYS',
        name: i18n.t('Last 7 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_14_DAYS',
        name: i18n.t('Last 14 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_30_DAYS',
        name: i18n.t('Last 30 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_60_DAYS',
        name: i18n.t('Last 60 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_90_DAYS',
        name: i18n.t('Last 90 days'),
        type: 'DAILY',
    },
    {
        id: 'LAST_180_DAYS',
        name: i18n.t('Last 180 days'),
        type: 'DAILY',
    },
    {
        id: 'THIS_WEEK',
        name: i18n.t('This week'),
        type: 'WEEKLY',
    },
    {
        id: 'LAST_WEEK',
        name: i18n.t('Last week'),
        type: 'WEEKLY',
    },
    {
        id: 'LAST_4_WEEKS',
        name: i18n.t('Last 4 weeks'),
        type: 'WEEKLY',
    },
    {
        id: 'LAST_12_WEEKS',
        name: i18n.t('Last 12 weeks'),
        type: 'WEEKLY',
    },
    {
        id: 'LAST_52_WEEKS',
        name: i18n.t('Last 52 weeks'),
        type: 'WEEKLY',
    },
    {
        id: 'WEEKS_THIS_YEAR',
        name: i18n.t('Weeks this year'),
        type: 'WEEKLY',
    },
    {
        id: 'THIS_BIWEEK',
        name: i18n.t('This bi-week'),
        type: 'BIWEEKLY',
    },
    {
        id: 'LAST_BIWEEK',
        name: i18n.t('Last bi-week'),
        type: 'BIWEEKLY',
    },
    {
        id: 'LAST_4_BIWEEKS',
        name: i18n.t('Last 4 bi-weeks'),
        type: 'BIWEEKLY',
    },
    {
        id: 'THIS_MONTH',
        name: i18n.t('This month'),
        type: 'MONTHLY',
    },
    {
        id: 'LAST_MONTH',
        name: i18n.t('Last month'),
        type: 'MONTHLY',
    },
    {
        id: 'LAST_3_MONTHS',
        name: i18n.t('Last 3 months'),
        type: 'MONTHLY',
    },
    {
        id: 'LAST_6_MONTHS',
        name: i18n.t('Last 6 months'),
        type: 'MONTHLY',
    },
    {
        id: 'LAST_12_MONTHS',
        name: i18n.t('Last 12 months'),
        type: 'MONTHLY',
    },
    {
        id: 'MONTHS_THIS_YEAR',
        name: i18n.t('Months this year'),
        type: 'MONTHLY',
    },
    {
        id: 'THIS_BIMONTH',
        name: i18n.t('This bi-month'),
        type: 'BIMONTHLY',
    },
    {
        id: 'LAST_BIMONTH',
        name: i18n.t('Last bi-month'),
        type: 'BIMONTHLY',
    },
    {
        id: 'LAST_6_BIMONTHS',
        name: i18n.t('Last 6 bi-months'),
        type: 'BIMONTHLY',
    },
    {
        id: 'BIMONTHS_THIS_YEAR',
        name: i18n.t('Bi-months this year'),
        type: 'BIMONTHLY',
    },
    {
        id: 'THIS_QUARTER',
        name: i18n.t('This quarter'),
        type: 'QUARTERLY',
    },
    {
        id: 'LAST_QUARTER',
        name: i18n.t('Last quarter'),
        type: 'QUARTERLY',
    },
    {
        id: 'LAST_4_QUARTERS',
        name: i18n.t('Last 4 quarters'),
        type: 'QUARTERLY',
    },
    {
        id: 'QUARTERS_THIS_YEAR',
        name: i18n.t('Quarters this year'),
        type: 'QUARTERLY',
    },
    {
        id: 'THIS_SIX_MONTH',
        name: i18n.t('This six-month'),
        type: 'SIXMONTHLY',
    },
    {
        id: 'LAST_SIX_MONTH',
        name: i18n.t('Last six-month'),
        type: 'SIXMONTHLY',
    },
    {
        id: 'LAST_2_SIXMONTHS',
        name: i18n.t('Last 2 six-months'),
        type: 'SIXMONTHLY',
    },
    {
        id: 'THIS_YEAR',
        name: i18n.t('This year'),
        type: 'YEARLY',
    },
    {
        id: 'LAST_YEAR',
        name: i18n.t('Last year'),
        type: 'YEARLY',
    },
    {
        id: 'LAST_5_YEARS',
        name: i18n.t('Last 5 years'),
        type: 'YEARLY',
    },
    {
        id: 'LAST_10_YEARS',
        name: i18n.t('Last 10 years'),
        type: 'YEARLY',
    },
    {
        id: 'THIS_FINANCIAL_YEAR',
        name: i18n.t('This financial year'),
        type: 'YEARLY',
    },
    {
        id: 'LAST_FINANCIAL_YEAR',
        name: i18n.t('Last financial year'),
        type: 'YEARLY',
    },
    {
        id: 'LAST_5_FINANCIAL_YEARS',
        name: i18n.t('Last 5 financial years'),
        type: 'YEARLY',
    },
];

// Periods that will only produce a single map (not for timeline/split view)
export const singleMapPeriods = [
    'TODAY',
    'YESTERDAY',
    'THIS_WEEK',
    'LAST_WEEK',
    'THIS_MONTH',
    'LAST_MONTH',
    'THIS_BIMONTH',
    'LAST_BIMONTH',
    'THIS_QUARTER',
    'LAST_QUARTER',
    'THIS_YEAR',
    'LAST_YEAR',
    'THIS_FINANCIAL_YEAR',
    'LAST_FINANCIAL_YEAR',
];

// Periods not supported for split view (maximum 12 maps)
export const invalidSplitViewPeriods = ['LAST_52_WEEKS', 'WEEKS_THIS_YEAR'];

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
