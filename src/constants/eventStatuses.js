import i18n from '@dhis2/d2-i18n'

export const EVENT_STATUS_ALL = 'ALL'
export const EVENT_STATUS_ACTIVE = 'ACTIVE'
export const EVENT_STATUS_COMPLETED = 'COMPLETED'

export const getEventStatuses = () => [
    {
        id: EVENT_STATUS_ALL,
        name: i18n.t('All'),
    },
    {
        id: EVENT_STATUS_ACTIVE,
        name: i18n.t('Active'),
    },
    {
        id: EVENT_STATUS_COMPLETED,
        name: i18n.t('Completed'),
    },
]
