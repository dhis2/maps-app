import { useCachedDataQuery } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'

const EarthEngineLoader = ({ config, onLoad }) => {
    const { currentUser } = useCachedDataQuery()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    useEffect(() => {
        earthEngineLoader({ config, nameProperty }).then(onLoad)
    }, [config, onLoad, nameProperty])

    return null
}

EarthEngineLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EarthEngineLoader
