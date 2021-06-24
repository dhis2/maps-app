import i18n from '@dhis2/d2-i18n';

export const getPeriodTypes = () => [
    { id: 'relativePeriods', name: i18n.t('Relative') },
    { id: 'Daily', name: i18n.t('Daily') },
    { id: 'Weekly', name: i18n.t('Weekly') },
    { id: 'Monthly', name: i18n.t('Monthly') },
    { id: 'BiMonthly', name: i18n.t('Bi-monthly') },
    { id: 'Quarterly', name: i18n.t('Quarterly') },
    { id: 'SixMonthly', name: i18n.t('Six-monthly') },
    { id: 'SixMonthlyApril', name: i18n.t('Six-monthly April') },
    { id: 'Yearly', name: i18n.t('Yearly') },
    { id: 'FinancialOctober', name: i18n.t('Financial year (Start October)') },
    { id: 'FinancialJuly', name: i18n.t('Financial year (Start July)') },
    { id: 'FinancialApril', name: i18n.t('Financial year (Start April)') },
    { id: 'StartEndDates', name: i18n.t('Start/end dates') },
];

export const getRelativePeriods = () => [
    { id: 'TODAY', name: i18n.t('Today') },
    { id: 'YESTERDAY', name: i18n.t('Yesterday') },
    { id: 'LAST_3_DAYS', name: i18n.t('Last 3 days') },
    { id: 'LAST_7_DAYS', name: i18n.t('Last 7 days') },
    { id: 'LAST_14_DAYS', name: i18n.t('Last 14 days') },
    { id: 'LAST_30_DAYS', name: i18n.t('Last 30 days') },
    { id: 'LAST_60_DAYS', name: i18n.t('Last 60 days') },
    { id: 'LAST_90_DAYS', name: i18n.t('Last 90 days') },
    { id: 'LAST_180_DAYS', name: i18n.t('Last 180 days') },
    { id: 'THIS_WEEK', name: i18n.t('This week') },
    { id: 'LAST_WEEK', name: i18n.t('Last week') },
    { id: 'LAST_4_WEEKS', name: i18n.t('Last 4 weeks') },
    { id: 'LAST_12_WEEKS', name: i18n.t('Last 12 weeks') },
    { id: 'LAST_52_WEEKS', name: i18n.t('Last 52 weeks') },
    { id: 'WEEKS_THIS_YEAR', name: i18n.t('Weeks this year') },
    { id: 'THIS_BIWEEK', name: i18n.t('This bi-week') },
    { id: 'LAST_BIWEEK', name: i18n.t('Last bi-week') },
    { id: 'LAST_4_BIWEEKS', name: i18n.t('Last 4 bi-weeks') },
    { id: 'THIS_MONTH', name: i18n.t('This month') },
    { id: 'LAST_MONTH', name: i18n.t('Last month') },
    { id: 'LAST_3_MONTHS', name: i18n.t('Last 3 months') },
    { id: 'LAST_6_MONTHS', name: i18n.t('Last 6 months') },
    { id: 'LAST_12_MONTHS', name: i18n.t('Last 12 months') },
    { id: 'MONTHS_THIS_YEAR', name: i18n.t('Months this year') },
    { id: 'THIS_BIMONTH', name: i18n.t('This bi-month') },
    { id: 'LAST_BIMONTH', name: i18n.t('Last bi-month') },
    { id: 'LAST_6_BIMONTHS', name: i18n.t('Last 6 bi-months') },
    { id: 'BIMONTHS_THIS_YEAR', name: i18n.t('Bi-months this year') },
    { id: 'THIS_QUARTER', name: i18n.t('This quarter') },
    { id: 'LAST_QUARTER', name: i18n.t('Last quarter') },
    { id: 'LAST_4_QUARTERS', name: i18n.t('Last 4 quarters') },
    { id: 'QUARTERS_THIS_YEAR', name: i18n.t('Quarters this year') },
    { id: 'THIS_SIX_MONTH', name: i18n.t('This six-month') },
    { id: 'LAST_SIX_MONTH', name: i18n.t('Last six-month') },
    { id: 'LAST_2_SIXMONTHS', name: i18n.t('Last 2 six-months') },
    { id: 'THIS_YEAR', name: i18n.t('This year') },
    { id: 'LAST_YEAR', name: i18n.t('Last year') },
    { id: 'LAST_5_YEARS', name: i18n.t('Last 5 years') },
    { id: 'THIS_FINANCIAL_YEAR', name: i18n.t('This financial year') },
    { id: 'LAST_FINANCIAL_YEAR', name: i18n.t('Last financial year') },
    { id: 'LAST_5_FINANCIAL_YEARS', name: i18n.t('Last 5 financial years') },
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
