import PropTypes from 'prop-types'
import { useEffect } from 'react'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const TrackedEntityLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()
    useEffect(() => {
        trackedEntityLoader(config).then((result) => {
            if (result.alerts.length) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

TrackedEntityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default TrackedEntityLoader
