import { useAlert } from '@dhis2/app-service-alerts'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
} from '../../constants/alerts.js'
import facilityLoader, {
    WARNING_NO_DATA,
    WARNING_NO_FACILITY_COORDINATES,
    WARNING_NO_GEOMETRY_COORDINATES,
    ERROR_CRITICAL,
} from '../../loaders/facilityLoader.js'

const EventLoader = ({ config, onLoad }) => {
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noFacilityCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )
    const noGeometryCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )
    const errorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    useEffect(() => {
        facilityLoader(config).then((result) => {
            result.alerts.forEach(({ message, code }) => {
                switch (code) {
                    case WARNING_NO_DATA:
                        noDataAlert.show({ msg: message })
                        break
                    case WARNING_NO_FACILITY_COORDINATES:
                        noFacilityCoordinatesAlert.show({ msg: message })
                        break
                    case WARNING_NO_GEOMETRY_COORDINATES:
                        noGeometryCoordinatesAlert.show({ msg: message })
                        break
                    case ERROR_CRITICAL:
                        errorAlert.show({ msg: message })
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
        noDataAlert,
        noFacilityCoordinatesAlert,
        noGeometryCoordinatesAlert,
        errorAlert,
    ])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
