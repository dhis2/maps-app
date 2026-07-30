import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import styles from '../styles/BottomPanel.module.css'

const COMBINED_VALUE = '__combined__'

const LayerSelectorControl = ({
    layers,
    activeLayerId,
    combinedView,
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
        {layers.map((layer) => (
            <option key={layer.id} value={layer.id}>
                {layer.name}
            </option>
        ))}
        <option value={COMBINED_VALUE}>{i18n.t('Combined')}</option>
    </select>
)

LayerSelectorControl.propTypes = {
    combinedView: PropTypes.bool.isRequired,
    layers: PropTypes.arrayOf(
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
