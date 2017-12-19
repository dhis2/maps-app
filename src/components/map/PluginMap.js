import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isNumeric } from 'd2-utilizr';
import Layer from './Layer';
import EventLayer from './EventLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';
import '../../../scss/app.scss';

const layerType = {
    event:       EventLayer,
    facility:    FacilityLayer,
    thematic:    ThematicLayer,
    boundary:    BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external:    ExternalLayer
};


// TODO: Resuse code from Map.js
class PluginMap extends Component {

    static contextTypes = {
        map: PropTypes.object,
    };

    componentWillMount() {
        // this.context.map.on('contextmenu', this.onRightClick, this);
    }

    componentDidMount() {
        const { bounds, latitude, longitude, zoom } = this.props;
        const map = this.context.map;

        this.node.appendChild(map.getContainer()); // Append map container to DOM

        // Add zoom control
        map.addControl({
            type: 'zoom',
            position: 'topright'
        });

        // Add fit bounds control
        map.addControl({
            type: 'fitBounds',
            position: 'topright'
        });

        // Add scale control
        map.addControl({
            type: 'scale',
            imperial: false
        });

        // TODO: Use mapzen key from Web API
        map.addControl({
            type: 'search',
            apiKey: 'search-Se1CFzK', // gis.init.systemInfo.mapzenSearchKey
        });

        // Add measurement control
        map.addControl({
            type: 'measure',
        });

        map.invalidateSize();

        if (Array.isArray(bounds)) {
            map.fitBounds(bounds);
        } else if (isNumeric(latitude) && isNumeric(longitude) && isNumeric(zoom)) {
            map.setView([latitude, longitude], zoom);
        }
    }

    render() {
        const { overlays } = this.props;

        const style = {
            width: '100%',
            height: '100%',
        };

        const basemap = { // TODO: Read from favorite
            id: 'osmLight',
            title: 'OSM Light',
            subtitle: 'Basemap',
            img: 'images/osmlight.png',
            config: {
                type: 'tileLayer',
                url: '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            },
        };

        return (
            <div ref={node => this.node = node} style={style}>
                {overlays.filter(layer => layer.isLoaded).map((layer, index) => {
                    layer.type = layer.layer.replace(/\d$/, ''); // TODO

                    const Overlay = layerType[layer.type] || Layer;

                    return (
                        <Overlay
                            key={layer.id}
                            index={index}
                            // openContextMenu={openContextMenu}
                            {...layer}
                        />
                    )
                })}
                <Layer key='basemap' {...basemap} />
            </div>
        )
    }
}

export default PluginMap;
