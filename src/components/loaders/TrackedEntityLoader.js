import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const TrackedEntityLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { serverVersion } = useConfig()
    useEffect(() => {
        trackedEntityLoader(config, serverVersion).then((result) => {
            if (result.alerts?.length && loaderAlertAction) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts, loaderAlertAction])

    return null
}

TrackedEntityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default TrackedEntityLoader
