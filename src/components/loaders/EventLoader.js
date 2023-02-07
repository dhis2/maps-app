import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'

const EventLoader = ({ config, onLoad }) => {
    useEffect(() => {
        eventLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
