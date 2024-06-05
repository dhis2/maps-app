import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'
import useLoaderAlerts from './useLoaderAlerts.js'

const EventLoader = ({ config, dataTableOpen, onLoad }) => {
    const { showAlerts } = useLoaderAlerts()

    useEffect(() => {
        eventLoader(config, dataTableOpen).then((result) => {
            if (result.alerts) {
                showAlerts(result.alerts)
            }
            onLoad(result)
        })
    }, [config, dataTableOpen, onLoad, showAlerts])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
