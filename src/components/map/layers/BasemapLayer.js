import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';

const BASEMAP_LAYER_INDEX = 0;

const BasemapLayer = ({ id, config, opacity, isVisible }, { map }) => {
    const [layer, setLayer] = useState(null);

    useEffect(() => {
        return function cleanup() {
            if (layer) {
                map.removeLayer(layer);
            }
        };
    }, []);

    useEffect(() => {
        const updateLayer = async () => {
            if (layer) {
                await map.removeLayer(layer);
                setLayer(null);
            }

            if (isVisible && id) {
                try {
                    const newLayer = map.createLayer({
                        ...config,
                        id,
                        index: BASEMAP_LAYER_INDEX,
                        opacity,
                        isVisible,
                    });

                    setLayer(newLayer); //even if addLayer throws, we need to keep a handle to the layer
                    await map.addLayer(newLayer);
                } catch (errorMessage) {
                    // TODO - use app-runtime alert system
                    log.error(`Basemap could not be added: ${errorMessage}`);
                }
            }
        };

        updateLayer();
    }, [id, isVisible, map, config]); //layer should not be a dependency

    useEffect(() => {
        layer?.setOpacity && layer.setOpacity(opacity);
    }, [opacity, map]); //layer should not be a dependency

    return null;
};

BasemapLayer.contextTypes = { map: PropTypes.object };

BasemapLayer.propTypes = {
    config: PropTypes.object,
    id: PropTypes.string,
    isVisible: PropTypes.bool,
    opacity: PropTypes.number,
};

export default BasemapLayer;
