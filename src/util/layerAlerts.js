import i18n from '@dhis2/d2-i18n'
import { ALERT_SEVERITY, LAYER_ALERTS } from '../constants/layerAlerts.js'

const SEVERITY_ORDER = [
    ALERT_SEVERITY.ERROR,
    ALERT_SEVERITY.WARNING,
    ALERT_SEVERITY.INFO,
]

export const createLayerAlert = (id, params = {}, details) => {
    const { severity, title, description } = LAYER_ALERTS[id]

    return {
        id,
        severity,
        title: title(params),
        ...(description && { description: description(params) }),
        ...(details && { details }),
    }
}

// What the server said, from a data engine FetchError (details from the API)
// or a plain Error. Loaders can add the failed request as error.request
export const getErrorDetails = (error) => {
    const { httpStatusCode, errorCode, message } = error?.details ?? {}
    return {
        ...(httpStatusCode && { httpStatusCode }),
        ...(errorCode && { errorCode }),
        message: message || error?.message || String(error),
        ...(error?.request && { request: error.request }),
    }
}

// errorCodes maps the DHIS2 error codes of a loader's requests to alert ids.
// A specific code says more than a 403 alone
export const createErrorAlert = (error, { errorCodes = {} } = {}) => {
    const details = getErrorDetails(error)
    const isAccessError =
        error?.type === 'access' || details.httpStatusCode === 403
    const id =
        errorCodes[details.errorCode] ??
        (isAccessError ? 'NO_ACCESS' : 'LOAD_FAILED')

    return createLayerAlert(id, {}, details)
}

// The alerts to show for a layer. Older loaders return loadError, a readable
// message, instead of an error alert
export const getLayerAlerts = ({ alerts = [], loadError } = {}) =>
    loadError
        ? [{ ...createLayerAlert('LOAD_FAILED'), description: loadError }]
        : alerts

// Alerts in this format; older loaders still return { code, message }
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

// The technical details as [label, value] rows, shown under "Details"
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

// Plain text to send to an administrator or developer: the context, then
// the technical details
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

const PREVIEW_PARAMS = { limit: '50,000' }
const PREVIEW_DETAILS = {
    httpStatusCode: 409,
    errorCode: 'E0000',
    message: 'Sample server message',
    request: 'analytics/sample/query',
}

// Developer preview: every alert on every layer, when the URL hash has
// "alertPreview" (e.g. #/?alertPreview)
export const getPreviewAlerts = () =>
    Object.entries(LAYER_ALERTS).map(([id, { severity }]) =>
        createLayerAlert(
            id,
            PREVIEW_PARAMS,
            severity === ALERT_SEVERITY.ERROR
                ? {
                      ...PREVIEW_DETAILS,
                      // Access errors are the 403s
                      ...(id === 'NO_ACCESS' && { httpStatusCode: 403 }),
                  }
                : undefined
        )
    )
