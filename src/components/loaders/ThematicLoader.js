import PropTypes from 'prop-types'
import { useEffect } from 'react'
import thematicLoader from '../../loaders/thematicLoader.js'

const ThematicLoader = ({ config, onLoad }) => {
    useEffect(() => {
        // console.log('thematicLoader', config.id);
        thematicLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ThematicLoader
