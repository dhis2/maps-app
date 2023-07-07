import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const EventLoader = ({ config, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()

    useEffect(() => {
        eventLoader(config).then((result) => {
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, onLoad, showAlerts])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
