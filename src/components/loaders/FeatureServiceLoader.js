import PropTypes from 'prop-types'
import { useEffect } from 'react'
import featureServiceLoader from '../../loaders/featureServiceLoader.js'

const FeatureServiceLoader = ({ config, onLoad }) => {
    useEffect(() => {
        featureServiceLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

FeatureServiceLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default FeatureServiceLoader
