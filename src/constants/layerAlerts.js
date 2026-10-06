import i18n from '@dhis2/d2-i18n'

export const ALERT_SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
}

const { ERROR, WARNING, INFO } = ALERT_SEVERITY

export const SEVERITY_ORDER = [ERROR, WARNING, INFO]

// Deleted and no longer accessible look the same to the app: say both
const unavailableHint = () =>
    i18n.t(
        'It may have been deleted, or your access to it may have changed. Contact your system administrator if you need it.'
    )

export const LAYER_ALERTS = {
    LOAD_FAILED: {
        severity: ERROR,
        title: () => i18n.t('Failed to load layer'),
    },
    NO_ACCESS: {
        severity: ERROR,
        title: () => i18n.t("You don't have access to this layer's data"),
        description: () =>
            i18n.t(
                'Your access may have changed. Contact your system administrator.'
            ),
    },
    PROGRAM_UNAVAILABLE: {
        severity: ERROR,
        title: () => i18n.t("This layer's program is not available"),
        description: unavailableHint,
    },
    TRACKED_ENTITY_TYPE_UNAVAILABLE: {
        severity: ERROR,
        title: () =>
            i18n.t("This layer's tracked entity type is not available"),
        description: unavailableHint,
    },
    ORG_UNITS_UNAVAILABLE: {
        severity: ERROR,
        title: () => i18n.t("This layer's org units are not available"),
        description: unavailableHint,
    },
    NO_DATA: {
        severity: WARNING,
        title: () => i18n.t('No data found'),
        description: () =>
            i18n.t(
                "Check the period, filters and org units. Data you don't have access to is not shown."
            ),
    },
    TRACKED_ENTITIES_TRUNCATED: {
        severity: WARNING,
        title: ({ limit }) =>
            i18n.t('Showing the first {{limit}} tracked entities', { limit }),
        description: () =>
            i18n.t('Narrow the period or org units to see all of them.'),
    },
    RELATIONSHIPS_FAILED: {
        severity: WARNING,
        title: () => i18n.t('Relationships could not be loaded'),
        description: unavailableHint,
    },
}

// DHIS2 error codes with a more specific alert than LOAD_FAILED, from
// analytics (E7...) and the tracker API (E1...)
export const ERROR_CODE_ALERTS = {
    E1003: 'PROGRAM_UNAVAILABLE',
    E7120: 'ORG_UNITS_UNAVAILABLE',
    E7125: 'TRACKED_ENTITY_TYPE_UNAVAILABLE',
    E7129: 'PROGRAM_UNAVAILABLE',
    E7143: 'ORG_UNITS_UNAVAILABLE',
}
