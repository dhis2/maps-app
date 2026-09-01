import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { getLayerSourceId } from '../../../util/layerSources.js'
import LayerSourceRow from './LayerSourceRow.jsx'
import styles from './styles/LayerSourceList.module.css'

const LayerSourceList = ({
    layers,
    onLayerSelect,
    isPinned,
    onTogglePin,
    onShowInfo,
    infoLayerId,
    onScroll,
}) => {
    if (!layers.length) {
        return (
            <div className={styles.empty}>
                {i18n.t('No layers match this filter.')}
            </div>
        )
    }

    return (
        <div
            className={styles.list}
            onScroll={onScroll}
            data-test="addlayersourcelist"
        >
            {layers.map((layer) => {
                const id = getLayerSourceId(layer)
                return (
                    <LayerSourceRow
                        key={id}
                        layer={layer}
                        onClick={onLayerSelect}
                        isPinned={isPinned(id)}
                        onTogglePin={onTogglePin}
                        onShowInfo={onShowInfo}
                        isInfoOpen={infoLayerId === id}
                    />
                )
            })}
        </div>
    )
}

LayerSourceList.propTypes = {
    isPinned: PropTypes.func.isRequired,
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
    onTogglePin: PropTypes.func.isRequired,
    infoLayerId: PropTypes.string,
    onScroll: PropTypes.func,
    onShowInfo: PropTypes.func,
}

export default LayerSourceList
