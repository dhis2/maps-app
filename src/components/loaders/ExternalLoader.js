import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import externalLoader from '../../loaders/externalLoader.js'

const ExternalLoader = ({ config, onLoad }) => {
    const engine = useDataEngine()

    useEffect(() => {
        externalLoader(config, engine).then(onLoad)
    }, [config, onLoad, engine])

    return null
}

ExternalLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ExternalLoader
