import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../../actions/alerts';

const BasemapLayer = ({ id, config, opacity, isVisible, onError }, { map }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        isVisible && id && addLayer();
    }, [id, isVisible]);

    useEffect(() => {
        const layer = map.getLayerAtIndex(0);
        layer?.setOpacity && layer.setOpacity(opacity);
    }, [opacity]);

    useEffect(() => {
        if (!isVisible) {
            removeLayer();
        }
    }, [isVisible]);

    const addLayer = async () => {
        await removeLayer();
        try {
            const theLayer = map.createLayer({
                ...config,
                id,
                index: 0,
                opacity,
                isVisible,
            });

            await map.addLayer(theLayer);
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
    };

    const removeLayer = async () => {
        const layer = map.getLayerAtIndex(0);
        if (layer) {
            await map.removeLayer(layer);
        }
    };

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
