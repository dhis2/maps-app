import PropTypes from 'prop-types';
import React, { useContext, useState, useEffect, createContext } from 'react';
import log from 'loglevel';
import mapApi from './map/MapApi';

export const MapCtx = createContext({});

const MapProvider = ({
    isPlugin,
    attributionControl,
    isSplitView,
    children,
}) => {
    const [map, setMap] = useState(null);

    useEffect(() => {
        const mp = mapApi({
            attributionControl,
            scrollZoom: !isPlugin,
        });

        mp.on('ready', () => {
            log.info('setMapReady true');
            setMap(mp);
        });

        return function cleanup() {
            if (mp) {
                mp.off('ready', () => setMap(null));
                if (isSplitView) {
                    map.unsync(this.props.layerId);
                }
                mp.remove();
                // delete map; // TODO?
            }
        };
    }, [isPlugin]);

    return <MapCtx.Provider value={{ map }}>{children}</MapCtx.Provider>;
};

MapProvider.propTypes = {
    attributionControl: PropTypes.bool.isRequired,
    children: PropTypes.node,
    isPlugin: PropTypes.bool.isRequired,
    isSplitView: PropTypes.bool.isRequired,
};

export default MapProvider;

export const useMapContext = () => useContext(MapCtx);
