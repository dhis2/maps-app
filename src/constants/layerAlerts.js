import i18n from '@dhis2/d2-i18n'

export const ALERT_SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
}

const { ERROR, WARNING, INFO } = ALERT_SEVERITY

export const SEVERITY_ORDER = [ERROR, WARNING, INFO]

// Layer alert ids
export const LAYER_ALERT_LOAD_FAILED = 'LOAD_FAILED'
export const LAYER_ALERT_NO_ACCESS = 'NO_ACCESS'
export const LAYER_ALERT_PROGRAM_UNAVAILABLE = 'PROGRAM_UNAVAILABLE'
export const LAYER_ALERT_TRACKED_ENTITY_TYPE_UNAVAILABLE =
    'TRACKED_ENTITY_TYPE_UNAVAILABLE'
export const LAYER_ALERT_ORG_UNITS_UNAVAILABLE = 'ORG_UNITS_UNAVAILABLE'
export const LAYER_ALERT_NO_DATA = 'NO_DATA'
export const LAYER_ALERT_TRACKED_ENTITIES_TRUNCATED =
    'TRACKED_ENTITIES_TRUNCATED'
export const LAYER_ALERT_RELATIONSHIPS_FAILED = 'RELATIONSHIPS_FAILED'

// Deleted and no longer accessible look the same to the app: say both
const unavailableHint = () =>
    i18n.t(
        'It may have been deleted, or your access to it may have changed. Contact your system administrator if you need it.'
    )

export const LAYER_ALERTS = {
    [LAYER_ALERT_LOAD_FAILED]: {
        severity: ERROR,
        title: () => i18n.t('Failed to load layer'),
    },
    [LAYER_ALERT_NO_ACCESS]: {
        severity: ERROR,
        title: () => i18n.t("You don't have access to this layer's data"),
        description: () =>
            i18n.t(
                'Your access may have changed. Contact your system administrator.'
            ),
    },
    [LAYER_ALERT_PROGRAM_UNAVAILABLE]: {
        severity: ERROR,
        title: () => i18n.t("This layer's program is not available"),
        description: unavailableHint,
    },
    [LAYER_ALERT_TRACKED_ENTITY_TYPE_UNAVAILABLE]: {
        severity: ERROR,
        title: () =>
            i18n.t("This layer's tracked entity type is not available"),
        description: unavailableHint,
    },
    [LAYER_ALERT_ORG_UNITS_UNAVAILABLE]: {
        severity: ERROR,
        title: () => i18n.t("This layer's org units are not available"),
        description: unavailableHint,
    },
    [LAYER_ALERT_NO_DATA]: {
        severity: WARNING,
        title: () => i18n.t('No data found'),
        description: () =>
            i18n.t(
                "Check the period, filters and org units. Data you don't have access to is not shown."
            ),
    },
    [LAYER_ALERT_TRACKED_ENTITIES_TRUNCATED]: {
        severity: WARNING,
        title: ({ limit }) =>
            i18n.t('Showing the first {{limit}} tracked entities', { limit }),
        description: () =>
            i18n.t('Narrow the period or org units to see all of them.'),
    },
    [LAYER_ALERT_RELATIONSHIPS_FAILED]: {
        severity: WARNING,
        title: () => i18n.t('Relationships could not be loaded'),
        description: unavailableHint,
    },
}

// DHIS2 error codes with a more specific alert than LOAD_FAILED, from
// analytics (E7...) and the tracker API (E1...)
export const ERROR_CODE_ALERTS = {
    E1003: LAYER_ALERT_PROGRAM_UNAVAILABLE,
    E7120: LAYER_ALERT_ORG_UNITS_UNAVAILABLE,
    E7125: LAYER_ALERT_TRACKED_ENTITY_TYPE_UNAVAILABLE,
    E7129: LAYER_ALERT_PROGRAM_UNAVAILABLE,
    E7143: LAYER_ALERT_ORG_UNITS_UNAVAILABLE,
}

// Analytics can't be used, but the tracker API can: the type has no events
// or its tables were never generated (E7144), or the user can't view event
// analytics (E7217)
export const ANALYTICS_FALLBACK_CODES = new Set(['E7144', 'E7217'])
