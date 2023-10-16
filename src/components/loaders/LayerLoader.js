import PropTypes from 'prop-types'
import React from 'react'
import EarthEngineLoader from './EarthEngineLoader.js'
import EventLoader from './EventLoader.js'
import ExternalLoader from './ExternalLoader.js'
import FacilityLoader from './FacilityLoader.js'
import OrgUnitLoader from './OrgUnitLoader.js'
import ThematicLoader from './ThematicLoader.js'
import TrackedEntityLoader from './TrackedEntityLoader.js'

const layerTypes = {
    earthEngine: EarthEngineLoader,
    event: EventLoader,
    external: ExternalLoader,
    facility: FacilityLoader,
    orgUnit: OrgUnitLoader,
    thematic: ThematicLoader,
    trackedEntity: TrackedEntityLoader,
}

const LayerLoader = ({ config, onLoad }) => {
    const type = config.layerType || config.layer
    const Loader = layerTypes[type]

    if (!Loader) {
        return null
    }

    return <Loader config={config} onLoad={onLoad} />
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
}

export default LayerLoader
