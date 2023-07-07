export const ALERT_SUCCESS = { success: true }
export const ALERT_SUCCESS_DELAY = { success: true, duration: 3000 }
export const ALERT_CRITICAL = { critical: true }
export const ALERT_WARNING = { warning: true }
export const ALERT_MESSAGE_DYNAMIC = ({ msg }) => msg
export const ALERT_OPTIONS_DYNAMIC = ({ isError }) =>
    isError ? ALERT_CRITICAL : ALERT_SUCCESS
