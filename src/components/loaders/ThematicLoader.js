import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import thematicLoader from '../../loaders/thematicLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const ThematicLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { currentUser } = useCachedDataQuery()
    const engine = useDataEngine()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const userId = currentUser.id

    useEffect(() => {
        thematicLoader({ config, engine, nameProperty, userId }).then(
            (result) => {
                if (result.alerts?.length && loaderAlertAction) {
                    showAlerts(result.alerts)
                }
                onLoad(result)
            }
        )
    }, [
        config,
        engine,
        onLoad,
        nameProperty,
        userId,
        showAlerts,
        loaderAlertAction,
    ])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default ThematicLoader
