import { useAlert as useRuntimeAlert } from '@dhis2/app-service-alerts'
import { useMemo } from 'react'
import { ALERT_CRITICAL } from '../constants/alerts.js'

function useAlert({ message, severity = ALERT_CRITICAL }) {
    const openMapErrorAlert = useRuntimeAlert(message, severity)

    const alert = useMemo(() => openMapErrorAlert, []) // eslint-disable-line react-hooks/exhaustive-deps

    return alert
}

export default useAlert
