import PropTypes from 'prop-types'
import React from 'react'
import EarthEngineLoader from './EarthEngineLoader.js'
import EventLoader from './EventLoader.js'
import ExternalLoader from './ExternalLoader.js'
import FacilityLoader from './FacilityLoader.js'
import OrgUnitLoader from './OrgUnitLoader.js'
import ThematicLoader from './ThematicLoader.js'
import TrackedEntityLoader from './TrackedEntityLoader.js'
import FeatureServiceLoader from './FeatureServiceLoader.js'

const layerType = {
    earthEngine: EarthEngineLoader,
    event: EventLoader,
    external: ExternalLoader,
    facility: FacilityLoader,
    orgUnit: OrgUnitLoader,
    thematic: ThematicLoader,
    trackedEntity: TrackedEntityLoader,
    featureService: FeatureServiceLoader,
}

const LayerLoader = ({ config, onLoad }) => {
    const Loader = layerType[config.layer]

    if (!Loader) {
        console.log('Unknown layer type', config.layer, config)
        return null
    }

    return <Loader config={config} onLoad={onLoad} />
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default LayerLoader
