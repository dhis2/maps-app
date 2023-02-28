import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import externalLoader from '../../loaders/externalLoader.js'

const ExternalLoader = ({ config, onLoad }) => {
    const { d2 } = useD2()
    useEffect(() => {
        externalLoader(config, d2).then(onLoad)
    }, [config, onLoad, d2])

    return null
}

ExternalLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default ExternalLoader
