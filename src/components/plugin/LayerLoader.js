import { Analytics, useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import eventLoader from '../../loaders/eventLoader.js'
import externalLoader from '../../loaders/externalLoader.js'
import facilityLoader from '../../loaders/facilityLoader.js'
import geoJsonUrlLoader from '../../loaders/geoJsonUrlLoader.js'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
import thematicLoader from '../../loaders/thematicLoader.js'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'

const loaders = {
    earthEngine: earthEngineLoader,
    event: eventLoader,
    external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    thematic: thematicLoader,
    geoJsonUrl: geoJsonUrlLoader,
    trackedEntity: trackedEntityLoader,
}

const LayerLoader = ({ config, onLoad }) => {
    const [analyticsEngine] = useState(() => Analytics.getAnalytics(engine))
    const { currentUser } = useCachedDataQuery()
    const { baseUrl, serverVersion } = useConfig()
    const engine = useDataEngine()
    const { systemInfo } = useConfig()
    const { instanceBaseUrl } = systemInfo
    const namePropertyUpper =
        currentUser.keyAnalysisDisplayProperty.toUpperCase()
    const userId = currentUser.id
    const keyAnalysisDisplayProperty = currentUser.keyAnalysisDisplayProperty

    useEffect(() => {
        const loader = loaders[config.layer]
        loader({
            config,
            engine,
            keyAnalysisDisplayProperty, // name/shortName
            userId,
            baseUrl,
            analyticsEngine, // Thematic and Event loader
            instanceBaseUrl, // GeoJson loader
            serverVersion, // Tracked entity loader
        }).then((result) => {
            // TODO handle errors

            onLoad(result)
        })
    }, [
        config,
        onLoad,
        engine,
        analyticsEngine,
        namePropertyUpper,
        userId,
        baseUrl,
        keyAnalysisDisplayProperty,
        instanceBaseUrl,
        serverVersion,
    ])

    return null
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default LayerLoader
