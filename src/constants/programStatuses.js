import i18n from '@dhis2/d2-i18n'

export const getProgramStatuses = () => [
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
        id: 'CANCELLED',
        name: i18n.t('Cancelled'),
    },
]
