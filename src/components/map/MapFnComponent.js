import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import log from 'loglevel';
import Layer from './layers/Layer';
import EventLayer from './layers/EventLayer';
import TrackedEntityLayer from './layers/TrackedEntityLayer';
import FacilityLayer from './layers/FacilityLayer';
import ThematicLayer from './layers/ThematicLayer';
import OrgUnitLayer from './layers/OrgUnitLayer';
import EarthEngineLayer from './layers/earthEngine/EarthEngineLayer';
import BasemapLayer from './layers/BasemapLayer';
import ExternalLayer from './layers/ExternalLayer';
import Popup from './Popup';
import styles from './styles/Map.module.css';
import { useMapContext } from '../MapProvider.js';
import { onFullscreenChange } from '../../util/map';

const layerType = {
    event: EventLayer,
    trackedEntity: TrackedEntityLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    orgUnit: OrgUnitLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
};

const Map = ({
    isPlugin,
    basemap,
    layers,
    feature,
    coordinatePopup: coordinates,
    closeCoordinatePopup,
    openContextMenu,
    setAggregations,
}) => {
    const { map } = useMapContext();
    const nodeRef = useCallback(
        node => {
            console.log('nodeRef map', map);
            if (node !== null && map) {
                node.appendChild(map.getContainer());
            }
        },
        [map]
    );

    useEffect(() => {
        console.log('event listeners map', map);
        if (map) {
            if (isPlugin) {
                map.toggleMultiTouch(true);
                map.on('fullscreenchange', toggleFullscreen);
            } else {
                map.on('contextmenu', onRightClick);
            }
        }
    }, [map]);

    const onRightClick = evt => {
        const [x, y] = evt.position;
        log.info('onRightClick', x, y);
        const { left, top } = map.getContainer().getBoundingClientRect();

        openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
        });
    };

    // From built-in fullscreen control
    const toggleFullscreen = ({ isFullscreen }) => {
        log.info('toggle fullscreen');
        return onFullscreenChange(map, isFullscreen);
    };

    const overlays = layers.filter(layer => layer.isLoaded);

    return (
        <div ref={nodeRef} className={styles.map}>
            {map && (
                <>
                    {overlays.map((config, index) => {
                        const Overlay = layerType[config.layer] || Layer;
                        const highlight =
                            feature && feature.layerId === config.id
                                ? feature
                                : null;

                        return (
                            <Overlay
                                key={config.id}
                                index={overlays.length - index}
                                feature={highlight}
                                openContextMenu={openContextMenu}
                                setAggregations={setAggregations}
                                {...config}
                            />
                        );
                    })}
                    <BasemapLayer {...basemap} />
                    {coordinates && (
                        <Popup
                            coordinates={coordinates}
                            onClose={closeCoordinatePopup}
                        >
                            {i18n.t('Longitude')}: {coordinates[0].toFixed(6)}
                            <br />
                            {i18n.t('Latitude')}: {coordinates[1].toFixed(6)}
                        </Popup>
                    )}
                </>
            )}
        </div>
    );
};

Map.propTypes = {
    isPlugin: PropTypes.bool.isRequired,
    isFullscreen: PropTypes.bool,
    basemap: PropTypes.object,
    layers: PropTypes.array,
    controls: PropTypes.array,
    feature: PropTypes.object,
    bounds: PropTypes.array,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    zoom: PropTypes.number,
    coordinatePopup: PropTypes.array,
    resizeCount: PropTypes.number,
    closeCoordinatePopup: PropTypes.func,
    openContextMenu: PropTypes.func.isRequired,
    setAggregations: PropTypes.func,
};

export default Map;
