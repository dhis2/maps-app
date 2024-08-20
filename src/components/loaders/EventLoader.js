import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const EventLoader = ({ config, dataTableOpen, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    const { currentUser } = useCachedDataQuery()
    const engine = useDataEngine()

    const nameProperty = currentUser.keyAnalysisDisplayProperty

    useEffect(() => {
        eventLoader({
            layerConfig: config,
            loadExtended: dataTableOpen,
            engine,
            nameProperty,
        }).then((result) => {
            if (result.alerts?.length && loaderAlertAction) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [
        config,
        onLoad,
        dataTableOpen,
        engine,
        nameProperty,
        showAlerts,
        loaderAlertAction,
    ])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default EventLoader
