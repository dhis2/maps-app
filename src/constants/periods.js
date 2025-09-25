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

export const PREDEFINED_PERIODS = 'PREDEFINED_PERIODS'
export const RELATIVE_PERIODS = 'RELATIVE_PERIODS'
export const FIXED_PERIODS = 'FIXED_PERIODS'
export const START_END_DATES = 'START_END_DATES'
export const LAST_UPDATED_DATES = 'lastUpdated'

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

// Periods not supported for split view (maximum 12 maps)
export const MULTIMAP_MIN_PERIODS = 2
export const MULTIMAP_MAX_PERIODS = 12

// Period types used for Earth Engine layers
export const BY_YEAR = 'BY_YEAR'
export const EE_MONTHLY = 'EE_MONTHLY'
export const EE_DAILY = 'EE_DAILY'
