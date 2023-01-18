import PropTypes from 'prop-types'
import React from 'react'
import FacilityLoader from './FacilityLoader.js'
import ThematicLoader from './ThematicLoader.js'

const layerType = {
    facility: FacilityLoader,
    thematic: ThematicLoader,
}

const LayerLoader = ({ config, onLoad }) => {
    const Loader = layerType[config.layer]

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
