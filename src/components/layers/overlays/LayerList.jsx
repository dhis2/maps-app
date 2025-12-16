import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import Layer from './Layer.jsx'
import styles from './styles/LayerList.module.css'

const LayerList = ({ layers, isSplitView, onLayerSelect }) => (
    <div className={styles.layerList}>
        {isSplitView ? (
            <div className={styles.split}>
                {i18n.t(
                    'Split view cannot be combined with other layer types.'
                )}
            </div>
        ) : (
            <div className={styles.list} data-test="addlayerlist">
                {layers.map((layer, index) => (
                    <Layer
                        key={`layer-${index}`}
                        onClick={onLayerSelect}
                        layer={layer}
                    />
                ))}
            </div>
        )}
    </div>
)

LayerList.propTypes = {
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
    isSplitView: PropTypes.bool,
}

export default LayerList
