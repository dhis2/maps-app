import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { setAlert } from '../../../actions/alerts';

const BasemapLayer = (
    { id, index = 0, config, opacity, isVisible, onError },
    context
) => {
    const [layer, setLayer] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        isVisible && addLayer();
    }, [id, isVisible]);

    useEffect(() => {
        layer?.setOpacity && layer.setOpacity(opacity);
    }, [layer, opacity]);

    useEffect(() => {
        if (!isVisible) {
            removeLayer();
        }
    }, [isVisible]);

    const addLayer = async () => {
        await removeLayer();
        try {
            const theLayer = context.map.createLayer({
                ...config,
                id,
                index,
                opacity,
                isVisible,
            });

            setLayer(theLayer);
            await context.map.addLayer(theLayer);
        } catch (errorMessage) {
            const message = `Basemap could not be added: ${errorMessage}`;
            console.log(message);

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
        if (layer) {
            await context.map.removeLayer(layer);
            setLayer(null);
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
