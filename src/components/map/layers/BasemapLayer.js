import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../../actions/alerts';

const BASEMAP_LAYER_INDEX = 0;

const BasemapLayer = ({ id, config, opacity, isVisible, onError }, { map }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const updateLayer = async () => {
            const oldLayer = map.getLayerAtIndex(BASEMAP_LAYER_INDEX);
            if (oldLayer) {
                await map.removeLayer(oldLayer);
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
    }, [id, isVisible, map, config]);

    useEffect(() => {
        const layer = map.getLayerAtIndex(BASEMAP_LAYER_INDEX);
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
