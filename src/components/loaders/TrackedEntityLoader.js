import { useAlert } from '@dhis2/app-service-alerts'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { ALERT_MESSAGE_DYNAMIC, ALERT_WARNING } from '../../constants/alerts.js'
import trackedEntityLoader, {
    WARNING_NO_DATA,
} from '../../loaders/trackedEntityLoader.js'

const TrackedEntityLoader = ({ config, onLoad }) => {
    const noDataAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_WARNING)
    useEffect(() => {
        trackedEntityLoader(config).then((result) => {
            result.alerts.forEach(({ message, code }) => {
                switch (code) {
                    case WARNING_NO_DATA:
                        noDataAlert.show({ msg: message })
                        break
                    default:
                        break
                }
            })
            onLoad(result)
        })
    }, [config, onLoad, noDataAlert])

    return null
}

TrackedEntityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default TrackedEntityLoader
