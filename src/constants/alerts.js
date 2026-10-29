export const ALERT_SUCCESS = { success: true }
export const ALERT_SUCCESS_DELAY = { success: true, duration: 3000 }
export const ALERT_CRITICAL = { critical: true }
export const ALERT_WARNING = { warning: true }
export const ALERT_INFO = { info: true }
export const ALERT_MESSAGE_DYNAMIC = ({ msg }) => msg
export const ALERT_OPTIONS_DYNAMIC = ({ isError }) =>
    isError ? ALERT_CRITICAL : ALERT_SUCCESS

// Loader alerts
export const WARNING_NO_DATA = 'WARNING_NO_DATA'
export const WARNING_ALL_EVENTS_OUTSIDE_OU = 'WARNING_ALL_EVENTS_OUTSIDE_OU'
export const WARNING_NO_OU_COORD = 'WARNING_NO_OU_COORD'
export const WARNING_NO_GEOMETRY_COORD = 'WARNING_NO_GEOMETRY_COORD'
export const WARNING_OU_BOUNDARIES_FETCH_FAILED =
    'WARNING_OU_BOUNDARIES_FETCH_FAILED'
export const WARNING_EXTERNAL_LAYER_NOT_FOUND =
    'WARNING_EXTERNAL_LAYER_NOT_FOUND'
export const ERROR_CRITICAL = 'ERROR_CRITICAL'
export const CUSTOM_ALERT = 'CUSTOM_ALERT'
