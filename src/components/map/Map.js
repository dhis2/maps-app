import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import mapApi from './MapApi';
import Layer from './layers/Layer';
import EventLayer from './layers/EventLayer';
import TrackedEntityLayer from './layers/TrackedEntityLayer';
import FacilityLayer from './layers/FacilityLayer';
import ThematicLayer from './layers/ThematicLayer';
import OrgUnitLayer from './layers/OrgUnitLayer';
import EarthEngineLayer from './layers/earthEngine/EarthEngineLayer';
import ExternalLayer from './layers/ExternalLayer';
import FlowLayer from './layers/FlowLayer';
import Popup from './Popup';
import { controlTypes } from './MapApi';
import { onFullscreenChange } from '../../util/map';
import styles from './styles/Map.module.css';

const layerType = {
    event: EventLayer,
    trackedEntity: TrackedEntityLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    orgUnit: OrgUnitLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
    flow: FlowLayer,
};

class Map extends Component {
    static propTypes = {
        isPlugin: PropTypes.bool,
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

    static defaultProps = {
        isPlugin: false,
    };

    static childContextTypes = {
        map: PropTypes.object.isRequired,
        isPlugin: PropTypes.bool.isRequired,
    };

    state = {};

    constructor(props, context) {
        super(props, context);
        const { isPlugin } = props;

        const map = mapApi({
            scrollZoom: !isPlugin,
        });

        if (isPlugin) {
            map.toggleMultiTouch(true);
            map.on('fullscreenchange', this.onFullscreenChange);
        } else {
            map.on('contextmenu', this.onRightClick, this);
        }

        this.map = map;

        map.on('ready', this.onMapReady);
    }

    getChildContext() {
        return {
            map: this.map,
            isPlugin: this.props.isPlugin,
        };
    }

    componentDidMount() {
        const { controls, bounds, latitude, longitude, zoom } = this.props;
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
    }

    componentDidUpdate(prevProps) {
        const { resizeCount, isFullscreen, isPlugin } = this.props;

        if (resizeCount !== prevProps.resizeCount) {
            this.map.resize();
        }

        // From map plugin resize method
        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            onFullscreenChange(this.map, isFullscreen);
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
            feature,
            coordinatePopup: coordinates,
            closeCoordinatePopup,
            openContextMenu,
            setAggregations,
        } = this.props;
        const { map } = this.state;

        const overlays = layers.filter(layer => layer.isLoaded);

        return (
            <div ref={node => (this.node = node)} className={styles.map}>
                {map && (
                    <Fragment>
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

    // From built-in fullscreen control
    onFullscreenChange = ({ isFullscreen }) => {
        onFullscreenChange(this.map, isFullscreen);
    };
}

export default Map;
