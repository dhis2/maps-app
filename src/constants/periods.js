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
} from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'

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
]

// TODO: import from @dhis2/analytics (needs to be defined)
const TODAY = 'TODAY'
const YESTERDAY = 'YESTERDAY'
const LAST_14_DAYS = 'LAST_14_DAYS'
const LAST_30_DAYS = 'LAST_30_DAYS'
const LAST_60_DAYS = 'LAST_60_DAYS'
const LAST_90_DAYS = 'LAST_90_DAYS'
const LAST_180_DAYS = 'LAST_180_DAYS'
const THIS_WEEK = 'THIS_WEEK'
const LAST_WEEK = 'LAST_WEEK'
const LAST_52_WEEKS = 'LAST_52_WEEKS'
const WEEKS_THIS_YEAR = 'WEEKS_THIS_YEAR'
const THIS_BIWEEK = 'THIS_BIWEEK'
const LAST_BIWEEK = 'LAST_BIWEEK'
const THIS_MONTH = 'THIS_MONTH'
const LAST_MONTH = 'LAST_MONTH'
const THIS_BIMONTH = 'THIS_BIMONTH'
const LAST_BIMONTH = 'LAST_BIMONTH'
const THIS_QUARTER = 'THIS_QUARTER'
const LAST_QUARTER = 'LAST_QUARTER'
const THIS_SIX_MONTH = 'THIS_SIX_MONTH'
const LAST_SIX_MONTH = 'LAST_SIX_MONTH'
const THIS_FINANCIAL_YEAR = 'THIS_FINANCIAL_YEAR'
const LAST_FINANCIAL_YEAR = 'LAST_FINANCIAL_YEAR'
const THIS_YEAR = 'THIS_YEAR'
const LAST_YEAR = 'LAST_YEAR'

export const PREDEFINED_PERIODS = 'PREDEFINED_PERIODS'
export const RELATIVE_PERIODS = 'RELATIVE_PERIODS'
export const START_END_DATES = 'START_END_DATES'

export const periodTypes = (includeRelativePeriods) => [
    ...(includeRelativePeriods
        ? [
              {
                  id: RELATIVE_PERIODS,
                  name: i18n.t('Relative'),
              },
          ]
        : []),
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
        id: START_END_DATES,
        name: i18n.t('Start/end dates'),
    },
]

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
    THIS_SIX_MONTH,
    LAST_SIX_MONTH,
    THIS_FINANCIAL_YEAR,
    LAST_FINANCIAL_YEAR,
    THIS_YEAR,
    LAST_YEAR,
]

// Periods not supported for split view (maximum 12 maps)
export const MAX_PERIODS = 12

// Period types used for Earth Engine layers
export const BY_YEAR = 'BY_YEAR'
export const EE_MONTHLY = 'EE_MONTHLY'
