import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import styles from '../styles/BottomPanel.module.css'

const COMBINED_VALUE = '__combined__'

// Replaces the old per-layer tab strip - a single dropdown listing every
// currently open layer plus Combined (greyed out unless the map has 2+
// eligible layers to join), rather than one tab per open layer.
const LayerSelectorControl = ({
    openLayers,
    activeLayerId,
    combinedView,
    combinedEnabled,
    onSelectLayer,
    onSelectCombined,
}) => (
    <select
        className={styles.layerSelect}
        aria-label={i18n.t('Choose a data table to view')}
        data-test="data-table-layer-selector"
        value={combinedView ? COMBINED_VALUE : activeLayerId ?? ''}
        onChange={(e) => {
            if (e.target.value === COMBINED_VALUE) {
                onSelectCombined()
            } else {
                onSelectLayer(e.target.value)
            }
        }}
    >
        {openLayers.map((layer) => (
            <option key={layer.id} value={layer.id}>
                {layer.name}
            </option>
        ))}
        <option value={COMBINED_VALUE} disabled={!combinedEnabled}>
            {i18n.t('Combined')}
        </option>
    </select>
)

LayerSelectorControl.propTypes = {
    combinedEnabled: PropTypes.bool.isRequired,
    combinedView: PropTypes.bool.isRequired,
    openLayers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
        })
    ).isRequired,
    onSelectCombined: PropTypes.func.isRequired,
    onSelectLayer: PropTypes.func.isRequired,
    activeLayerId: PropTypes.string,
}

export default LayerSelectorControl
