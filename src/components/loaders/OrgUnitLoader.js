import PropTypes from 'prop-types'
import { useEffect } from 'react'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const OrgUnitLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()

    useEffect(() => {
        orgUnitLoader(config).then((result) => {
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

OrgUnitLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default OrgUnitLoader
