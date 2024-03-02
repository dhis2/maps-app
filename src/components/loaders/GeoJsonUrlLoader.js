import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import {
    ALERT_CRITICAL,
    ALERT_MESSAGE_DYNAMIC,
} from '../../constants/alerts.js'
import geoJsonUrlLoader from '../../loaders/geoJsonUrlLoader.js'

const GeoJsonUrlLoader = ({ config, onLoad, onError }) => {
    const loadFailedAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const engine = useDataEngine()
    const { baseUrl } = useConfig()

    useEffect(() => {
        geoJsonUrlLoader(config, engine, baseUrl).then((data) => {
            if (data.error) {
                onError(data)

                loadFailedAlert.show({
                    msg: i18n.t(
                        'Failed to load map layer "{{layername}}": {{message}}',
                        {
                            layername: data.name,
                            message: data.error,
                            nsSeparator: '^^',
                        }
                    ),
                })
                return
            }
            return onLoad(data)
        })
    }, [config, onLoad, onError, engine, baseUrl, loadFailedAlert])

    return null
}

GeoJsonUrlLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onError: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default GeoJsonUrlLoader
