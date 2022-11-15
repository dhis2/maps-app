import { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import log from 'loglevel';

const BASEMAP_LAYER_INDEX = 0;

const BasemapLayer = ({ id, config, opacity, isVisible }, { map }) => {
    const basemap = useMemo(
        () =>
            map.createLayer({
                ...config,
                id,
                index: BASEMAP_LAYER_INDEX,
            }),
        [id, config]
    );

    useEffect(() => {
        // Run async to catch error while basemap is added
        const addBasemap = async () => {
            try {
                await map.addLayer(basemap);
            } catch (errorMessage) {
                // TODO - use app-runtime alert system
                log.error(`Basemap could not be added: ${errorMessage}`);
            }
        };

        addBasemap();
        return () => map.removeLayer(basemap);
    }, [map, basemap]);

    useEffect(() => {
        basemap.setOpacity(opacity);
    }, [basemap, opacity]);

    useEffect(() => {
        basemap.setVisibility(isVisible);
    }, [basemap, isVisible]);

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
