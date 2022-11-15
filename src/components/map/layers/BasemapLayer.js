import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../../actions/alerts';

const BASEMAP_LAYER_INDEX = 0;

const BasemapLayer = ({ id, config, opacity, isVisible, onError }, { map }) => {
    const [layer, setLayer] = useState(null);
    const dispatch = useDispatch();

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
                    const message = `Basemap could not be added: ${errorMessage}`;

                    if (onError) {
                        onError(message);
                    } else {
                        dispatch(
                            setAlert({
                                critical: true,
                                message,
                            })
                        );
                    }
                }
            }
        };

        updateLayer();
    }, [id, isVisible, map, config]); //layer should not be a dependency

    useEffect(() => {
        layer?.setOpacity && layer.setOpacity(opacity);
    }, [opacity, map]);

    return null;
};

BasemapLayer.contextTypes = { map: PropTypes.object };

BasemapLayer.propTypes = {
    config: PropTypes.object,
    id: PropTypes.string,
    isVisible: PropTypes.bool,
    onError: PropTypes.func,
    opacity: PropTypes.number,
};

export default BasemapLayer;
