import PropTypes from 'prop-types'
import React from 'react'
import EarthEngineLoader from '../loaders/EarthEngineLoader.js'
import EventLoader from '../loaders/EventLoader.js'
import ExternalLoader from '../loaders/ExternalLoader.js'
import FacilityLoader from '../loaders/FacilityLoader.js'
import GeoJsonUrlLoader from '../loaders/GeoJsonUrlLoader.js'
import OrgUnitLoader from '../loaders/OrgUnitLoader.js'
import ThematicLoader from '../loaders/ThematicLoader.js'
import TrackedEntityLoader from '../loaders/TrackedEntityLoader.js'

const layerType = {
    earthEngine: EarthEngineLoader,
    event: EventLoader,
    external: ExternalLoader,
    facility: FacilityLoader,
    orgUnit: OrgUnitLoader,
    thematic: ThematicLoader,
    trackedEntity: TrackedEntityLoader,
    geoJsonUrl: GeoJsonUrlLoader,
}

const LayerLoader = ({ config, dataTableOpen, onLoad, loaderAlertAction }) => {
    const Loader = layerType[config.layer]

    if (!Loader) {
        console.log('Unknown layer type', config.layer, config)
        return null
    }

    return (
        <Loader
            config={config}
            onLoad={onLoad}
            dataTableOpen={dataTableOpen}
            loaderAlertAction={loaderAlertAction}
        />
    )
}

LayerLoader.defaultProps = {
    dataTableOpen: false,
    onError: Function.prototype,
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    dataTableOpen: PropTypes.bool,
    loaderAlertAction: PropTypes.func,
}

export default LayerLoader
