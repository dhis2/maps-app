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
export const WARNING_NO_OU_COORD = 'WARNING_NO_OU_COORD'
export const WARNING_NO_GEOMETRY_COORD = 'WARNING_NO_GEOMETRY_COORD'
export const ERROR_CRITICAL = 'ERROR_CRITICAL'
export const CUSTOM_ALERT = 'CUSTOM_ALERT'

// Spatial analysis guardrail alerts
export const WARNING_RATE_DENOMINATOR = 'WARNING_RATE_DENOMINATOR'
export const WARNING_LOW_N = 'WARNING_LOW_N'
export const WARNING_NO_NEIGHBORS = 'WARNING_NO_NEIGHBORS'
export const WARNING_SPARSE_COORDS = 'WARNING_SPARSE_COORDS'
