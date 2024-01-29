import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import eventLoader from '../../loaders/eventLoader.js'

const EventLoader = ({ config, onLoad }) => {
    const dataTableOpen = useSelector((state) => !!state.dataTable)
    useEffect(() => {
        eventLoader(config, dataTableOpen).then(onLoad)
    }, [config, onLoad, dataTableOpen])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
