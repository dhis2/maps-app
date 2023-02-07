import PropTypes from 'prop-types'
import { useEffect } from 'react'
import externalLoader from '../../loaders/externalLoader.js'

const ExternalLoader = ({ config, onLoad }) => {
    useEffect(() => {
        externalLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

ExternalLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ExternalLoader
