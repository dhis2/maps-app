import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import Layer from './Layer';
import styles from './styles/LayerList.module.css';

const LayerList = ({ layers, isSplitView, onLayerSelect }) => (
    <div className={styles.layerList}>
        {isSplitView ? (
            <div className={styles.split}>
                {i18n.t(
                    'Split view can not be combined with other layer types.'
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
);

LayerList.propTypes = {
    layers: PropTypes.array.isRequired,
    isSplitView: PropTypes.bool,
    onLayerSelect: PropTypes.func.isRequired,
};

export default LayerList;
