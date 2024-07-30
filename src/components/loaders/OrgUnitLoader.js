import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const OrgUnitLoader = ({ config, onLoad, loaderAlertAction }) => {
    const { showAlerts } = useLoaderAlerts(loaderAlertAction)

    useEffect(() => {
        orgUnitLoader(config).then((result) => {
            if (result.alerts?.length && loaderAlertAction) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts, loaderAlertAction])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    loaderAlertAction: PropTypes.func,
}

export default OrgUnitLoader
