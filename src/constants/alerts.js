export const ALERT_SUCCESS = { success: true }
export const ALERT_SUCCESS_DELAY = { success: true, duration: 3000 }
export const ALERT_CRITICAL = { critical: true }
export const ALERT_WARNING = { warning: true }
export const ALERT_INFO = { info: true }
export const ALERT_MESSAGE_DYNAMIC = ({ msg }) => msg
export const ALERT_OPTIONS_DYNAMIC = ({ isError }) =>
    isError ? ALERT_CRITICAL : ALERT_SUCCESS

// Loader alerts
export const INFO_NO_DATA = 'INFO_NO_DATA'
export const WARNING_NO_OU_COORD = 'WARNING_NO_OU_COORD'
export const WARNING_NO_GEOMETRY_COORD = 'WARNING_NO_GEOMETRY_COORD'
export const ERROR_CRITICAL = 'ERROR_CRITICAL'
export const WARNING_NO_FACILITY_COORD = 'WARNING_NO_FACILITY_COORD'
export const WARNING_PAGED_EVENTS = 'WARNING_PAGED_EVENTS'
export const ERROR_NO_ACCESS = 'ERROR_NO_ACCESS'
export const ERROR_UNKNOWN = 'ERROR_UNKNOWN'
