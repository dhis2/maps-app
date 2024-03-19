import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'

const EventLoader = ({ config, dataTableOpen, onLoad }) => {
    useEffect(() => {
        eventLoader(config, dataTableOpen).then(onLoad)
    }, [config, onLoad, dataTableOpen])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
