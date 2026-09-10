import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import styles from '../styles/BottomPanel.module.css'

const LayerSelectorControl = ({ layers, activeLayerId, onSelectLayer }) => (
    <select
        className={styles.layerSelect}
        aria-label={i18n.t('Choose a data table to view')}
        data-test="data-table-layer-selector"
        value={activeLayerId ?? ''}
        onChange={(e) => onSelectLayer(e.target.value)}
    >
        {layers.map((layer) => (
            <option key={layer.id} value={layer.id}>
                {layer.name}
            </option>
        ))}
    </select>
)

LayerSelectorControl.propTypes = {
    layers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
        })
    ).isRequired,
    onSelectLayer: PropTypes.func.isRequired,
    activeLayerId: PropTypes.string,
}

export default LayerSelectorControl
