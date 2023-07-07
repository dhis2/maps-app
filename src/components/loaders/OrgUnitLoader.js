import { useAlert } from '@dhis2/app-service-alerts'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
} from '../../constants/alerts.js'
import orgUnitLoader, {
    WARNING_NO_COORD_FOR_OU,
    WARNING_NO_COORD_FOR_CATCHMENT,
    ERROR_CRITICAL,
} from '../../loaders/orgUnitLoader.js'

const OrgUnitLoader = ({ config, onLoad }) => {
    const errorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const noOUCoordinatesAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noCatchmentCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )
    useEffect(() => {
        orgUnitLoader(config).then((result) => {
            result.alerts.forEach(({ message, code }) => {
                switch (code) {
                    case WARNING_NO_COORD_FOR_OU:
                        noOUCoordinatesAlert.show({ msg: message })
                        break
                    case WARNING_NO_COORD_FOR_CATCHMENT:
                        noCatchmentCoordinatesAlert.show({ msg: message })
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
        noOUCoordinatesAlert,
        noCatchmentCoordinatesAlert,
        errorAlert,
    ])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default OrgUnitLoader
