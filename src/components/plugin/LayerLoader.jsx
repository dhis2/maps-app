import { Analytics, useDataOutputPeriodTypes } from '@dhis2/analytics'
import { useDataEngine, useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { THEMATIC_LAYER, EVENT_LAYER } from '../../constants/layers.js'
import earthEngineLoader from '../../loaders/earthEngineLoader.js'
import eventLoader from '../../loaders/eventLoader.js'
import externalLoader from '../../loaders/externalLoader.js'
import facilityLoader from '../../loaders/facilityLoader.js'
import geoJsonUrlLoader from '../../loaders/geoJsonUrlLoader.js'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
import thematicLoader from '../../loaders/thematicLoader.js'
import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'
import { useCachedData } from '../cachedDataProvider/CachedDataProvider.jsx'

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
    const { baseUrl, serverVersion } = useConfig()
    const engine = useDataEngine()
    const [analyticsEngine] = useState(() => Analytics.getAnalytics(engine))
    const { currentUser } = useCachedData()
    const { keyAnalysisDisplayProperty, id: userId } = currentUser
    const periodTypeData = useDataOutputPeriodTypes()

    useEffect(() => {
        if (
            periodTypeData?.supportsEnabledPeriodTypes &&
            !periodTypeData?.enabledPeriodTypesData &&
            [THEMATIC_LAYER, EVENT_LAYER].includes(config.layer)
        ) {
            return
        }
        const loader = loaders[config.layer]
        loader({
            config,
            engine,
            keyAnalysisDisplayProperty, // name/shortName
            userId,
            baseUrl,
            analyticsEngine, // Thematic and Event loader
            periodTypeData, // Thematic and Event loader
            serverVersion, // Tracked entity loader
        }).then((result) => {
            onLoad(result)
        })
    }, [
        config,
        onLoad,
        engine,
        analyticsEngine,
        periodTypeData,
        userId,
        baseUrl,
        keyAnalysisDisplayProperty,
        serverVersion,
    ])

    return null
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default LayerLoader
