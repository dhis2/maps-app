import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import thematicLoader from '../../loaders/thematicLoader.js'

const ThematicLoader = ({ config, onLoad }) => {
    const { currentUser } = useCachedDataQuery()
    const engine = useDataEngine()
    const nameProperty = currentUser.keyAnalysisDisplayProperty.toUpperCase()
    useEffect(() => {
        thematicLoader({ config, engine, nameProperty }).then(onLoad)
    }, [config, engine, onLoad, nameProperty])

    return null
}

ThematicLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ThematicLoader
