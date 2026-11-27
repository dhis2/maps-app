import i18n from '@dhis2/d2-i18n'

export const EVENT_STATUS_ALL = 'ALL'
export const EVENT_STATUS_ACTIVE = 'ACTIVE'
export const EVENT_STATUS_COMPLETED = 'COMPLETED'
export const EVENT_STATUS_SCHEDULE = 'SCHEDULE'

// Named as the other analytics apps name them; other statuses keep their code
export const getEventStatusName = (status) => {
    const names = {
        [EVENT_STATUS_ACTIVE]: i18n.t('Active'),
        [EVENT_STATUS_COMPLETED]: i18n.t('Completed'),
        [EVENT_STATUS_SCHEDULE]: i18n.t('Scheduled'),
    }
    return names[status] ?? status
}

export const getEventStatuses = () => [
    {
        id: EVENT_STATUS_ALL,
        name: i18n.t('All'),
    },
    {
        id: EVENT_STATUS_ACTIVE,
        name: getEventStatusName(EVENT_STATUS_ACTIVE),
    },
    {
        id: EVENT_STATUS_COMPLETED,
        name: getEventStatusName(EVENT_STATUS_COMPLETED),
    },
]
