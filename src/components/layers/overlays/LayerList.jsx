import PropTypes from 'prop-types'
import React from 'react'
import { THEMATIC_LAYER } from '../../../constants/layers.js'
import Layer from './Layer.jsx'
import styles from './styles/LayerList.module.css'

const LayerList = ({ layers, isSplitView, onLayerSelect }) => {
    const displayedLayers = isSplitView
        ? layers.filter((layer) => layer.layer === THEMATIC_LAYER)
        : layers
    return (
        <div className={styles.layerList}>
            <div className={styles.list} data-test="addlayerlist">
                {displayedLayers.map((layer, index) => (
                    <Layer
                        key={`layer-${index}`}
                        onClick={onLayerSelect}
                        layer={layer}
                    />
                ))}
            </div>
        </div>
    )
}

LayerList.propTypes = {
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
    isSplitView: PropTypes.bool,
}

export default LayerList
