import PropTypes from 'prop-types'
import React from 'react'
import EarthEngineLoader from './EarthEngineLoader.js'
import EventLoader from './EventLoader.js'
import ExternalLoader from './ExternalLoader.js'
import FacilityLoader from './FacilityLoader.js'
import GeoJsonUrlLoader from './GeoJsonUrlLoader.js'
import OrgUnitLoader from './OrgUnitLoader.js'
import ThematicLoader from './ThematicLoader.js'
import TrackedEntityLoader from './TrackedEntityLoader.js'

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
    loaderAlertAction: Function.prototype,
}

LayerLoader.propTypes = {
    config: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    dataTableOpen: PropTypes.bool,
    loaderAlertAction: PropTypes.func,
}

export default LayerLoader
