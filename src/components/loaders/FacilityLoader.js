import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import facilityLoader from '../../loaders/facilityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const FacilityLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { currentUser } = useCachedDataQuery()
    const { baseUrl } = useConfig()
    const engine = useDataEngine()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const userId = currentUser.id

    useEffect(() => {
        facilityLoader({ config, engine, nameProperty, userId, baseUrl }).then(
            (result) => {
                if (result.alerts?.length && loaderAlertAction) {
                    showAlerts(result.alerts)
                }
                onLoad(result)
            }
        )
    }, [
        config,
        onLoad,
        engine,
        nameProperty,
        userId,
        baseUrl,
        showAlerts,
        loaderAlertAction,
    ])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default FacilityLoader
