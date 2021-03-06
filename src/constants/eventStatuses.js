import i18n from '@dhis2/d2-i18n';

export const getEventStatuses = () => [
    {
        id: 'ALL',
        name: i18n.t('All'),
    },
    {
        id: 'ACTIVE',
        name: i18n.t('Active'),
    },
    {
        id: 'COMPLETED',
        name: i18n.t('Completed'),
    },
    {
        id: 'SCHEDULE',
        name: i18n.t('Schedule'),
    },
    {
        id: 'OVERDUE',
        name: i18n.t('Overdue'),
    },
    {
        id: 'SKIPPED',
        name: i18n.t('Skipped'),
    },
];
