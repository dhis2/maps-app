import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isNumeric from 'd2-utilizr/lib/isNumeric';
import Layer from './Layer';
import EventLayer from './EventLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';
import { openContextMenu, closeCoordinatePopup } from '../../actions/map';
import { HEADER_HEIGHT, LAYERS_PANEL_WIDTH, RIGHT_PANEL_WIDTH } from '../../constants/layout';

const layerType = {
    event: EventLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    boundary: BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
};

class Map extends Component {
    static contextTypes = {
        map: PropTypes.object,
    };

    componentWillMount() {
        this.context.map.on('contextmenu', this.onRightClick, this);
    }

    componentDidMount() {
        const { bounds, latitude, longitude, zoom } = this.props;
        const map = this.context.map;

        this.node.appendChild(map.getContainer()); // Append map container to DOM

        // Add zoom control
        map.addControl({
            type: 'zoom',
            position: 'topright',
        });

        // Add fit bounds control
        map.addControl({
            type: 'fitBounds',
            position: 'topright',
        });

        // Add scale control
        map.addControl({
            type: 'scale',
            imperial: false,
        });

        // Add place search control (OSM Nominatim)
        map.addControl({
            type: 'search',
        });

        // Add measurement control
        map.addControl({
            type: 'measure',
        });

        if (Array.isArray(bounds)) {
            map.fitBounds(bounds);
        } else if (
            isNumeric(latitude) &&
            isNumeric(longitude) &&
            isNumeric(zoom)
        ) {
            map.setView([latitude, longitude], zoom);
        }
    }

    componentDidUpdate(prevProps) {
        const { coordinatePopup } = this.props;

        if (coordinatePopup) {
            this.showCoordinate(coordinatePopup);
        }

        this.context.map.invalidateSize();
    }

    // Remove map
    componentWillUnmount() {
        this.context.map.remove();
    }

    showCoordinate(coord) {
        L.popup()
            .setLatLng([coord[1], coord[0]])
            .setContent(
                'Longitude: ' +
                    coord[0].toFixed(6) +
                    '<br />Latitude: ' +
                    coord[1].toFixed(6)
            )
            .on('remove', this.props.closeCoordinatePopup)
            .openOn(this.context.map);
    }

    onRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        const latlng = evt.latlng;
        const position = [
            evt.originalEvent.x,
            evt.originalEvent.pageY || evt.originalEvent.y,
        ];

        this.props.openContextMenu({
            position,
            coordinate: [latlng.lng, latlng.lat],
        });
    }

    render() {
        const {
            basemap,
            basemaps,
            mapViews,
            layersPanelOpen,
            rightPanelOpen,
            dataTableOpen,
            dataTableHeight,
            openContextMenu,
        } = this.props;

        const basemapConfig = {
            ...basemaps.filter(b => b.id === basemap.id)[0],
            ...basemap,
        };

        const layers = [...mapViews].reverse();

        const style = {
            position: 'absolute',
            top: HEADER_HEIGHT,
            left: layersPanelOpen ? LAYERS_PANEL_WIDTH : 0,
            bottom: dataTableOpen ? dataTableHeight : 0,
            right: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0,
        };

        return (
            <div ref={node => (this.node = node)} style={style}>
                {layers.filter(layer => layer.isLoaded).map((config, index) => {
                    const Overlay = layerType[config.layer] || Layer;

                    return (
                        <Overlay
                            key={config.id}
                            index={index}
                            openContextMenu={openContextMenu}
                            {...config}
                        />
                    );
                })}
                <Layer key="basemap" {...basemapConfig} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.map,
    basemaps: state.basemaps,
    layersPanelOpen: state.ui.layersPanelOpen,
    rightPanelOpen: state.ui.rightPanelOpen && !!state.map.id,
    dataTableOpen: state.dataTable,
    dataTableHeight: state.ui.dataTableHeight,
});

export default connect(mapStateToProps, {
    openContextMenu,
    closeCoordinatePopup,
})(Map);
