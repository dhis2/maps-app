import PropTypes from 'prop-types'
import { useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const EarthEngineLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()

    useEffect(() => {
        earthEngineLoader(config).then((result) => {
            if (result.alerts.length) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

EarthEngineLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EarthEngineLoader
