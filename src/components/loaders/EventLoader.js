import { useAlert } from '@dhis2/app-service-alerts'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
} from '../../constants/alerts.js'
import eventLoader, {
    WARNING_NO_DATA,
    WARNING_PAGED_EVENTS,
    ERROR_NO_ACCESS,
    ERROR_UNKNOWN,
} from '../../loaders/eventLoader.js'

const EventLoader = ({ config, dataTableOpen, onLoad }) => {
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const pagedEventsAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noAccessAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const unknownErrorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    useEffect(() => {
        eventLoader(config, dataTableOpen).then((result) => {
            result.alerts.forEach(({ message, code }) => {
                switch (code) {
                    case WARNING_NO_DATA:
                        noDataAlert.show({ msg: message })
                        break
                    case WARNING_PAGED_EVENTS:
                        pagedEventsAlert.show({ msg: message })
                        break
                    case ERROR_NO_ACCESS:
                        noAccessAlert.show({ msg: message })
                        break
                    case ERROR_UNKNOWN:
                        unknownErrorAlert.show({ msg: message })
                        break
                    default:
                        break
                }
            })
            onLoad(result)
        })
    }, [
        config,
        onLoad,
        dataTableOpen,
        noDataAlert,
        pagedEventsAlert,
        noAccessAlert,
        unknownErrorAlert,
    ])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
