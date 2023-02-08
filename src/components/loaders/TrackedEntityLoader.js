import PropTypes from 'prop-types'
import { useEffect } from 'react'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'

const TrackedEntityLoader = ({ config, onLoad }) => {
    useEffect(() => {
        trackedEntityLoader(config).then(onLoad)
    }, [config, onLoad])

    return null
}

TrackedEntityLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default TrackedEntityLoader
