import { ALERT_SEVERITY, LAYER_ALERTS } from '../constants/layerAlerts.js'
import { getHashUrlParam } from './history.js'
import { createLayerAlert } from './layerAlerts.js'

// Developer preview of every layer alert, in the app only: add
// "alertPreview" to the URL hash (e.g. #/?alertPreview). To remove it, delete
// this file and its call in hooks/useLoadLayerWithRedux.js

const PREVIEW_PARAMS = { limit: '50,000' }
const PREVIEW_DETAILS = {
    httpStatusCode: 409,
    errorCode: 'E0000',
    message: 'Sample server message',
    request: 'analytics/sample/query',
}

const getPreviewDetails = (id, severity) => {
    if (severity !== ALERT_SEVERITY.ERROR) {
        return
    }
    return id === 'NO_ACCESS'
        ? { ...PREVIEW_DETAILS, httpStatusCode: 403 }
        : PREVIEW_DETAILS
}

export const getPreviewAlerts = () =>
    Object.entries(LAYER_ALERTS).map(([id, { severity }]) =>
        createLayerAlert(id, {
            params: PREVIEW_PARAMS,
            details: getPreviewDetails(id, severity),
        })
    )

// Adds the preview alerts the layer doesn't have
export const withPreviewAlerts = (layer) => {
    if (getHashUrlParam('alertPreview') === undefined) {
        return layer
    }
    const alerts = layer.alerts ?? []
    const ids = new Set(alerts.map((alert) => alert.id))

    return {
        ...layer,
        alerts: [
            ...alerts,
            ...getPreviewAlerts().filter((alert) => !ids.has(alert.id)),
        ],
    }
}
