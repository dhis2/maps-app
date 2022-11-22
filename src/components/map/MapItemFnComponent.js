import React, { useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './styles/MapItem.module.css';
import { onFullscreenChange } from '../../util/map';
import { useMapContext } from '../MapProvider.js';

const MapItem = ({
    isPlugin,
    layerId,
    index,
    setMapControls,
    isFullscreen,
    count,
    children,
}) => {
    const { map } = useMapContext();

    const prevIsFullscreen = useRef();

    useEffect(() => {
        prevIsFullscreen.current = isFullscreen;
    }, []);

    useEffect(() => {
        if (map && isPlugin) {
            map.toggleMultiTouch(true);
        }
    }, [map, isPlugin]);

    const fitLayerBounds = useCallback(() => {
        if (map) {
            map.resize();

            const bounds = map.getLayersBounds();
            if (bounds) {
                map.fitBounds(bounds);
            } else {
                map.fitWorld();
            }
        }
    }, [map]);

    useEffect(() => {
        if (map) {
            fitLayerBounds();
            map.resize();
        }
    }, [map, count]);

    useEffect(() => {
        map && map.sync(layerId);
    }, [map, layerId]);

    useEffect(() => {
        map && index == 0 && setMapControls(map);
    }, [map, index]);

    useEffect(() => {
        if (map && isPlugin && prevIsFullscreen.current !== isFullscreen) {
            onFullscreenChange(this.map, isFullscreen);
            map.resize();
            prevIsFullscreen.current = isFullscreen;
        }
    }, [map, isPlugin, isFullscreen]);

    const nodeRef = useCallback(
        node => {
            if (node !== null && map) {
                node.appendChild(map.getContainer());
            }
        },
        [map]
    );

    return (
        <div
            ref={nodeRef}
            className={styles.mapItem}
            style={{
                width: count === 4 ? '50%' : '33.3333%',
            }}
        >
            {map && children}
        </div>
    );
};

MapItem.propTypes = {
    isPlugin: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    index: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    layerId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    setMapControls: PropTypes.func.isRequired,
};

export default MapItem;
