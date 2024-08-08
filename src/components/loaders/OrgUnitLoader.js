import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const OrgUnitLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { currentUser } = useCachedDataQuery()
    const { baseUrl } = useConfig()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const engine = useDataEngine()

    useEffect(() => {
        orgUnitLoader({ config, engine, nameProperty, baseUrl }).then(
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
        baseUrl,
        showAlerts,
        loaderAlertAction,
    ])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default OrgUnitLoader
