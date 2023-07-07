import { useAlert } from '@dhis2/app-service-alerts'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
    ALERT_MESSAGE_DYNAMIC,
    ALERT_CRITICAL,
    ALERT_WARNING,
} from '../../constants/alerts.js'
import thematicLoader, {
    WARNING_NO_DATA,
    WARNING_NO_OU_COORD,
    WARNING_NO_GEOMETRY_COORD,
    ERROR_CRITICAL,
} from '../../loaders/thematicLoader.js'

const ThematicLoader = ({ config, onLoad }) => {
    const errorAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noOUCoordinatesAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    const noCatchmentCoordinatesAlert = useAlert(
        ALERT_MESSAGE_DYNAMIC,
        ALERT_WARNING
    )
    useEffect(() => {
        thematicLoader(config).then((result) => {
            result.alerts.forEach(({ message, code }) => {
                switch (code) {
                    case WARNING_NO_DATA:
                        noDataAlert.show({ msg: message })
                        break
                    case WARNING_NO_OU_COORD:
                        noOUCoordinatesAlert.show({ msg: message })
                        break
                    case WARNING_NO_GEOMETRY_COORD:
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
        noDataAlert,
        noOUCoordinatesAlert,
        noCatchmentCoordinatesAlert,
        errorAlert,
    ])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ThematicLoader
