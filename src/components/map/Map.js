import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import mapApi from './MapApi';
import Layer from './Layer';
import EventLayer from './EventLayer';
import TrackedEntityLayer from './TrackedEntityLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';
import Popup from './Popup';
import { controlTypes } from './MapApi';
import styles from './styles/Map.module.css';

const layerType = {
    event: EventLayer,
    trackedEntity: TrackedEntityLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    boundary: BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
};

class Map extends Component {
    static propTypes = {
        isPlugin: PropTypes.bool,
        isFullscreen: PropTypes.bool,
        basemap: PropTypes.object,
        layers: PropTypes.array,
        controls: PropTypes.array,
        bounds: PropTypes.array,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        zoom: PropTypes.number,
        coordinatePopup: PropTypes.array,
        resizeCount: PropTypes.number,
        closeCoordinatePopup: PropTypes.func,
        openContextMenu: PropTypes.func.isRequired,
        onCloseContextMenu: PropTypes.func,
    };

    static defaultProps = {
        isPlugin: false,
        isFullscreen: false,
    };

    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    state = {};

    constructor(props, context) {
        super(props, context);
        const { isPlugin } = props;

        const map = mapApi({
            scrollZoom: !isPlugin,
        });

        if (isPlugin) {
            map.on('click', props.onCloseContextMenu);
            map.on('fullscreenchange', this.onFullScreenChange);
        } else {
            map.on('contextmenu', this.onRightClick, this);
        }

        this.map = map;

        map.on('ready', this.onMapReady);
    }

    getChildContext() {
        return {
            map: this.map,
        };
    }

    componentDidMount() {
        const {
            controls,
            bounds,
            latitude,
            longitude,
            zoom,
            isPlugin,
            isFullscreen,
        } = this.props;
        const { map } = this;

        // Append map container to DOM
        this.node.appendChild(map.getContainer());

        map.resize();

        // Add map controls
        if (controls) {
            controls
                .filter(control => controlTypes.includes(control.type))
                .forEach(control => map.addControl(control));
        }

        const layerBounds = map.getLayersBounds();

        if (Array.isArray(layerBounds)) {
            map.fitBounds(layerBounds);
        } else if (bounds) {
            map.fitBounds(bounds);
        } else if (latitude && longitude && zoom) {
            map.setView([longitude, latitude], zoom);
        } else {
            map.fitWorld();
        }

        if (isPlugin) {
            this.onFullScreenChange({ isFullscreen });
        }
    }

    componentDidUpdate(prevProps) {
        const { resizeCount, isFullscreen, isPlugin } = this.props;

        if (resizeCount !== prevProps.resizeCount) {
            this.map.resize();
        }

        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            this.onFullScreenChange({ isFullscreen });
        }
    }

    // Remove map
    componentWillUnmount() {
        if (this.map) {
            this.map.off('ready', this.onMapReady);
            this.map.remove();
            delete this.map;
        }
    }

    render() {
        const {
            basemap,
            layers,
            coordinatePopup: coordinates,
            closeCoordinatePopup,
            openContextMenu,
        } = this.props;
        const { map } = this.state;

        const overlays = layers.filter(layer => layer.isLoaded);

        return (
            <div ref={node => (this.node = node)} className={styles.map}>
                {map && (
                    <Fragment>
                        {overlays.map((config, index) => {
                            const Overlay = layerType[config.layer] || Layer;

                            return (
                                <Overlay
                                    key={config.id}
                                    index={overlays.length - index}
                                    openContextMenu={openContextMenu}
                                    {...config}
                                />
                            );
                        })}
                        {basemap.isVisible !== false && <Layer {...basemap} />}
                        {coordinates && (
                            <Popup
                                coordinates={coordinates}
                                onClose={closeCoordinatePopup}
                            >
                                {i18n.t('Longitude')}:{' '}
                                {coordinates[0].toFixed(6)}
                                <br />
                                {i18n.t('Latitude')}:{' '}
                                {coordinates[1].toFixed(6)}
                            </Popup>
                        )}
                    </Fragment>
                )}
            </div>
        );
    }

    onRightClick = evt => {
        const [x, y] = evt.position;
        const { left, top } = this.map.getContainer().getBoundingClientRect();

        this.props.openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
        });
    };

    onMapReady = map => this.setState({ map });

    onFullScreenChange = ({ isFullscreen }) =>
        this.map.toggleScrollZoom(isFullscreen);
}

export default Map;
