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

const GeoJsonUrlLoader = ({ config, onLoad }) => {
    const loadFailedAlert = useAlert(ALERT_MESSAGE_DYNAMIC, ALERT_CRITICAL)
    const engine = useDataEngine()
    const { baseUrl } = useConfig()

    useEffect(() => {
        geoJsonUrlLoader(config, engine, baseUrl).then((data) => {
            if (data.error) {
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
            }
            return onLoad(data)
        })
    }, [config, onLoad, engine, baseUrl, loadFailedAlert])

    return null
}

GeoJsonUrlLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default GeoJsonUrlLoader
