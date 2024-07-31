import PropTypes from 'prop-types'
import { useEffect } from 'react'
import facilityLoader from '../../loaders/facilityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const FacilityLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)
    useEffect(() => {
        facilityLoader(config).then((result) => {
            if (result.alerts?.length && loaderAlertAction) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts, loaderAlertAction])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default FacilityLoader
