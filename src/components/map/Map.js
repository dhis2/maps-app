import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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

const layerType = {
    event: EventLayer,
    trackedEntity: TrackedEntityLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    boundary: BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
};

const styles = {
    root: {
        height: '100%',
    },
};

class Map extends Component {
    static propTypes = {
        isPlugin: PropTypes.bool,
        basemap: PropTypes.object,
        layers: PropTypes.array,
        controls: PropTypes.array,
        bounds: PropTypes.array,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        zoom: PropTypes.number,
        coordinatePopup: PropTypes.array,
        closeCoordinatePopup: PropTypes.func,
        openContextMenu: PropTypes.func.isRequired,
        onCloseContextMenu: PropTypes.func,
        classes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        isPlugin: false,
    };

    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    getChildContext() {
        return {
            map: this.map,
        };
    }

    constructor(props, context) {
        super(props, context);
        const { isPlugin } = props;

        const map = mapApi({
            scrollWheelZoom: !isPlugin,
        });

        if (isPlugin) {
            map.on('click', props.onCloseContextMenu);
        } else {
            map.on('contextmenu', this.onRightClick, this);
        }

        this.map = map;
    }

    componentDidMount() {
        const { controls, bounds, latitude, longitude, zoom } = this.props;
        const { map } = this;

        // Append map container to DOM
        this.node.appendChild(map.getContainer());

        map.resize();

        // Add map controls
        if (controls) {
            controls.forEach(control => map.addControl(control));
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

    // Remove map
    componentWillUnmount() {
        if (this.map) {
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
            classes,
        } = this.props;

        const overlays = layers.filter(layer => layer.isLoaded);

        return (
            <div ref={node => (this.node = node)} className={classes.root}>
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
                        {i18n.t('Longitude')}: {coordinates[0].toFixed(6)}
                        <br />
                        {i18n.t('Latitude')}: {coordinates[1].toFixed(6)}
                    </Popup>
                )}
            </div>
        );
    }

    onRightClick = evt => {
        this.props.openContextMenu(evt);
    };
}

export default withStyles(styles)(Map);
