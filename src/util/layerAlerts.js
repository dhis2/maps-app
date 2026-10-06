import i18n from '@dhis2/d2-i18n'
import {
    ALERT_SEVERITY,
    ERROR_CODE_ALERTS,
    LAYER_ALERTS,
    LAYER_ALERT_LOAD_FAILED,
    LAYER_ALERT_NO_ACCESS,
    SEVERITY_ORDER,
} from '../constants/layerAlerts.js'

export const createLayerAlert = (id, { params = {}, details } = {}) => {
    const { severity, title, description } = LAYER_ALERTS[id]

    return {
        id,
        severity,
        title: title(params),
        ...(description && { description: description(params) }),
        ...(details && { details }),
    }
}

// What the server said, from a data engine FetchError or a plain Error
export const getErrorDetails = (error) => {
    const { httpStatusCode, errorCode, message } = error?.details ?? {}
    return {
        ...(httpStatusCode && { httpStatusCode }),
        ...(errorCode && { errorCode }),
        message: message || error?.message || String(error),
        ...(error?.request && { request: error.request }),
    }
}

// For .catch(): adds the failed request to the error, for the alert details
export const throwWithRequest = (request) => (error) => {
    if (error instanceof Object) {
        error.request ??= request
    }
    throw error
}

// An error alert for any thrown error. A known error code says more than a
// 403 alone
export const createLayerAlertFromError = (error) => {
    const details = getErrorDetails(error)
    const isAccessError =
        error?.type === 'access' || details.httpStatusCode === 403
    const id =
        ERROR_CODE_ALERTS[details.errorCode] ??
        (isAccessError ? LAYER_ALERT_NO_ACCESS : LAYER_ALERT_LOAD_FAILED)

    return createLayerAlert(id, { details })
}

// LEGACY-ALERTS: loaders not migrated yet return loadError and
// { code, message } alerts. Remove when every loader returns layer alerts
export const getLayerAlerts = ({ alerts = [], loadError } = {}) => {
    if (!loadError) {
        return alerts
    }
    const alert = createLayerAlert(LAYER_ALERT_LOAD_FAILED)
    return [{ ...alert, description: loadError }]
}

// LEGACY-ALERTS: remove when every loader returns layer alerts
export const isLayerAlert = (alert) => Boolean(alert?.severity)

export const hasLayerError = (layer) =>
    getLayerAlerts(layer).some(
        (alert) => alert.severity === ALERT_SEVERITY.ERROR
    )

export const sortBySeverity = (alerts) =>
    [...alerts].sort(
        (a, b) =>
            SEVERITY_ORDER.indexOf(a.severity) -
            SEVERITY_ORDER.indexOf(b.severity)
    )

const formatVersion = (version) =>
    version?.full ||
    (version &&
        [version.major, version.minor, version.patch]
            .filter((part) => part !== undefined)
            .join('.'))

const hasValue = ([, value]) => value !== undefined && value !== ''

export const getDetailRows = ({
    httpStatusCode,
    errorCode,
    message,
    request,
} = {}) =>
    [
        [i18n.t('HTTP status'), httpStatusCode],
        [i18n.t('Error code'), errorCode],
        [i18n.t('Server message'), message],
        [i18n.t('Request'), request],
    ].filter(hasValue)

// Plain text for an administrator or developer
export const formatAlertDetails = (
    alert,
    { layerName, layerType, serverVersion, appVersion, date = new Date() } = {}
) =>
    [
        [i18n.t('Problem'), alert.title],
        [i18n.t('Layer'), layerName && `${layerName} (${layerType})`],
        [i18n.t('App version'), formatVersion(appVersion)],
        [i18n.t('Server version'), formatVersion(serverVersion)],
        [i18n.t('Time'), date.toISOString()],
        [i18n.t('Alert'), alert.id],
        ...getDetailRows(alert.details),
    ]
        .filter(hasValue)
        .map(([label, value]) => `${label}: ${value}`)
        .join('\n')
