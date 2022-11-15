import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import BasemapLayer from './layers/BasemapLayer';
import ThematicLayer from './layers/ThematicLayer';
import styles from './styles/SplitView.module.css';

const SplitView = ({
    isPlugin,
    basemap,
    layer,
    feature,
    controls,
    openContextMenu,
    isFullscreen,
    interpretationModalOpen,
}) => {
    const [showFullscreen, setShowFullscreen] = useState();
    const [map, setMap] = useState(); // Called from map child
    const containerRef = useRef();

    // From built-in fullscreen control
    const onFullscreenChange = useCallback(
        ({ isFullscreen }) => setShowFullscreen(isFullscreen),
        []
    );

    useEffect(() => {
        if (map && controls && containerRef.current) {
            controls.forEach(control => {
                map.addControl(control);
                containerRef.current.append(
                    map.getControlContainer(control.type)
                );
            });
        }
    }, [map, controls, containerRef]);

    useEffect(() => {
        if (map && isPlugin) {
            map.on('fullscreenchange', onFullscreenChange);
        }
        return () => {
            if (map && isPlugin) {
                map.off('fullscreenchange', onFullscreenChange);
            }
        };
    }, [map, isPlugin, onFullscreenChange]);

    useEffect(() => {
        // From map plugin resize method
        setShowFullscreen(isFullscreen);
    }, [isFullscreen]);

    const { id, periods = [] } = layer;

    return !interpretationModalOpen ? (
        <div
            ref={containerRef}
            className={cx('dhis2-map-split-view', styles.splitView)}
        >
            {periods.map((period, index) => (
                <MapItem
                    key={period.id}
                    index={index}
                    count={periods.length}
                    layerId={id}
                    setMapControls={setMap}
                    isPlugin={isPlugin}
                    isFullscreen={showFullscreen}
                >
                    <BasemapLayer {...basemap} />
                    <ThematicLayer
                        index={1}
                        period={period}
                        feature={feature}
                        {...layer}
                        openContextMenu={openContextMenu}
                    />
                    <PeriodName period={period.name} />
                </MapItem>
            ))}
        </div>
    ) : null;
};

SplitView.propTypes = {
    isPlugin: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    layer: PropTypes.object.isRequired,
    basemap: PropTypes.object,
    feature: PropTypes.object,
    controls: PropTypes.array,
    interpretationModalOpen: PropTypes.bool,
    openContextMenu: PropTypes.func.isRequired,
};

SplitView.defaultProps = {
    openContextMenu: () => {},
};

export default SplitView;
