import PropTypes from 'prop-types'
import { useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'

const EarthEngineLoader = ({ config, onLoad }) => {
    useEffect(() => {
        earthEngineLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

EarthEngineLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EarthEngineLoader
