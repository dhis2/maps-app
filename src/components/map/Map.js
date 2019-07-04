import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import isNumeric from 'd2-utilizr/lib/isNumeric';
import mapApi from './MapApi';
import Layer from './Layer';
import EventLayer from './EventLayer';
import TrackedEntityLayer from './TrackedEntityLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';
import MapName from './MapName';
import DownloadLegend from '../download/DownloadLegend';
import { mapControls } from '../../constants/mapControls';
import { openContextMenu, closeCoordinatePopup } from '../../actions/map';

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
    mapContainer: {
        height: '100%',
        '& img': {
            // Override from ui/core/UI'
            maxWidth: 'none',
        },
        '& .leaflet-control-zoom a': {
            // Override from ui/core/UI'
            color: 'black!important',
        },
        '& .leaflet-control-measure a': {
            fontSize: '12px!important',
        },
        '& .leaflet-popup-content th': {
            fontWeight: 'bold',
            paddingRight: 5,
        },
    },
    mapDownload: {
        // Roboto font is not loaded by dom-to-image => switch to Arial
        '& div': {
            fontFamily: 'Arial,sans-serif!important',
        },
        '& .leaflet-control-zoom, & .leaflet-control-geocoder, & .leaflet-control-measure, & .leaflet-control-fit-bounds': {
            display: 'none!important',
        },
    },
};

class Map extends Component {
    static childContextTypes = {
        map: PropTypes.object.isRequired,
    };

    static propTypes = {
        basemap: PropTypes.object,
        basemaps: PropTypes.array,
        bounds: PropTypes.array,
        dataTableOpen: PropTypes.bool,
        dataTableHeight: PropTypes.number,
        isDownload: PropTypes.bool,
        interpretationsPanelOpen: PropTypes.bool,
        layersPanelOpen: PropTypes.bool,
        legendPosition: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        mapViews: PropTypes.array,
        showName: PropTypes.bool,
        zoom: PropTypes.number,
        coordinatePopup: PropTypes.array,
        closeCoordinatePopup: PropTypes.func.isRequired,
        openContextMenu: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
    };

    getChildContext() {
        return {
            map: this.map,
        };
    }

    constructor(props, context) {
        super(props, context);
        this.map = mapApi();
        this.map.on('contextmenu', this.onRightClick, this);
    }

    componentDidMount() {
        const { bounds, latitude, longitude, zoom } = this.props;
        const map = this.map;

        this.node.appendChild(map.getContainer()); // Append map container to DOM
        map.resize();

        // Add map controls
        mapControls.forEach(control => map.addControl(control));

        const layerBounds = map.getLayersBounds();

        // If layers are created before the map
        if (Array.isArray(layerBounds)) {
            map.fitBounds(layerBounds);
        } else if (Array.isArray(bounds)) {
            map.fitBounds(bounds);
        } else if (
            isNumeric(latitude) &&
            isNumeric(longitude) &&
            isNumeric(zoom)
        ) {
            map.setView([latitude, longitude], zoom);
        }
    }

    componentDidUpdate() {
        const { coordinatePopup } = this.props;

        if (coordinatePopup) {
            this.showCoordinate(coordinatePopup);
        }

        this.map.resize();
    }

    componentWillUnmount() {
        this.map.remove();
        delete this.map;
    }

    showCoordinate(coord) {
        const content =
            'Longitude: ' +
            coord[0].toFixed(6) +
            '<br />Latitude: ' +
            coord[1].toFixed(6);

        this.map.openPopup(content, coord, this.props.closeCoordinatePopup);
    }

    onRightClick = evt => {
        this.props.openContextMenu(evt);
    };

    render() {
        const {
            basemap,
            basemaps,
            mapViews,
            showName,
            isDownload,
            legendPosition,
            openContextMenu,
            classes,
        } = this.props;

        const basemapConfig = {
            ...basemaps.filter(b => b.id === basemap.id)[0],
            ...basemap,
        };

        const layers = [...mapViews.filter(layer => layer.isLoaded)].reverse();

        return (
            <div
                id="dhis2-maps-container"
                ref={node => (this.node = node)}
                className={classes.mapContainer}
            >
                <MapName />
                {layers.map((config, index) => {
                    const Overlay = layerType[config.layer] || Layer;

                    return (
                        <Overlay
                            key={config.id}
                            index={layers.length - index}
                            openContextMenu={openContextMenu}
                            {...config}
                        />
                    );
                })}
                <Layer key="basemap" {...basemapConfig} />
                {isDownload && legendPosition && (
                    <DownloadLegend
                        position={legendPosition}
                        layers={mapViews}
                        showName={showName}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.map,
    basemaps: state.basemaps,
    isDownload: state.download.showDialog,
    showName: state.download.showDialog ? state.download.showName : true,
    legendPosition: state.download.showLegend
        ? state.download.legendPosition
        : null,
});

export default connect(
    mapStateToProps,
    {
        openContextMenu,
        closeCoordinatePopup,
    }
)(withStyles(styles)(Map));
