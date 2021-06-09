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

export const periodGroups = [
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

export const periodTypes = () => [
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
