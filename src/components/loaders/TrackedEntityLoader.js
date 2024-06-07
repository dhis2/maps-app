import PropTypes from 'prop-types'
import { useEffect } from 'react'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const TrackedEntityLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    useEffect(() => {
        trackedEntityLoader(config).then((result) => {
            console.log('te show the alerts', result.alerts)
            if (result.alerts?.length) {
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
    loaderAlertAction: PropTypes.func,
}

export default TrackedEntityLoader
