import PropTypes from 'prop-types'
import { useEffect } from 'react'
import geoJsonUrlLoader from '../../loaders/geoJsonUrlLoader.js'

const GeoJsonUrlLoader = ({ config, onLoad }) => {
    useEffect(() => {
        geoJsonUrlLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

GeoJsonUrlLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default GeoJsonUrlLoader
