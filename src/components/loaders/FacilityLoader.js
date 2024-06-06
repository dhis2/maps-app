import PropTypes from 'prop-types'
import { useEffect } from 'react'
import facilityLoader from '../../loaders/facilityLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const FacilityLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()
    useEffect(() => {
        facilityLoader(config).then((result) => {
            if (result.alerts?.length) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

FacilityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default FacilityLoader
