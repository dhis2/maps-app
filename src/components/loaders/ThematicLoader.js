import PropTypes from 'prop-types'
import { useEffect } from 'react'
import thematicLoader from '../../loaders/thematicLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const ThematicLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()

    useEffect(() => {
        thematicLoader(config).then((result) => {
            if (result.alerts.length) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ThematicLoader
