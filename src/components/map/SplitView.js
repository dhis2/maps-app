import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import PeriodName from './PeriodName';
import MapItem from './MapItem';
import Layer from './layers/Layer';
import ThematicLayer from './layers/ThematicLayer';
import styles from './styles/SplitView.module.css';

const SplitView = ({
    isPlugin,
    basemap,
    layer,
    feature,
    controls,
    interpretationModalOpen,
    openContextMenu,
}) => {
    const [isFullscreen, setIsFullscreen] = useState();
    const [mapControls, setMapControls] = useState();
    const containerRef = useRef();

    const { id, periods = [] } = layer;

    useEffect(() => {
        if (mapControls && containerRef.current && controls) {
            controls.forEach(control => {
                mapControls.addControl(control);
                containerRef.current.append(
                    mapControls.getControlContainer(control.type)
                );
            });

            if (isPlugin) {
                mapControls.on('fullscreenchange', setIsFullscreen);
            }
        }

        return () => {
            if (mapControls && isPlugin) {
                mapControls.off('fullscreenchange', setIsFullscreen);
            }
        };
    }, [mapControls, containerRef, controls, isPlugin]);

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
                    setMapControls={setMapControls}
                    isPlugin={isPlugin}
                    isFullscreen={isFullscreen}
                >
                    <Layer index={0} {...basemap} />
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
