import { useCachedDataQuery } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const EarthEngineLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { currentUser } = useCachedDataQuery()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const userId = currentUser.id

    useEffect(() => {
        earthEngineLoader({ config, nameProperty, userId }).then((result) => {
            if (result.alerts?.length && loaderAlertAction) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts, loaderAlertAction, nameProperty, userId])

    return null
}

EarthEngineLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default EarthEngineLoader
