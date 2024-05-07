import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import eventLoader from '../../loaders/eventLoader.js'

const EventLoader = ({ config, dataTableOpen, onLoad }) => {
    const { currentUser } = useCachedDataQuery()
    const engine = useDataEngine()

    const nameProperty = currentUser.keyAnalysisDisplayProperty

    useEffect(() => {
        eventLoader({
            layerConfig: config,
            dataTableOpen,
            engine,
            nameProperty,
        }).then(onLoad)
    }, [config, onLoad, dataTableOpen, engine, nameProperty])

    return null
}

EventLoader.propTypes = {
    config: PropTypes.object.isRequired,
    dataTableOpen: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default EventLoader
