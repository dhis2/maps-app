import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../../actions/alerts';

const removeLayer = async map => {
    const layer = map.getLayerAtIndex(0);
    if (layer) {
        await map.removeLayer(layer);
    }
};

const BasemapLayer = ({ id, config, opacity, isVisible, onError }, { map }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const updateLayer = async () => {
            await removeLayer(map);
            if (isVisible && id) {
                try {
                    const layer = map.createLayer({
                        ...config,
                        id,
                        index: 0,
                        opacity,
                        isVisible,
                    });

                    await map.addLayer(layer);
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
        const layer = map.getLayerAtIndex(0);
        layer?.setOpacity && layer.setOpacity(opacity);
    }, [opacity, map]);

    return null;
};

BasemapLayer.contextTypes = { map: PropTypes.object };

BasemapLayer.propTypes = {
    config: PropTypes.object,
    id: PropTypes.string,
    index: PropTypes.number,
    isVisible: PropTypes.bool,
    onError: PropTypes.func,
    opacity: PropTypes.number,
};

export default BasemapLayer;
