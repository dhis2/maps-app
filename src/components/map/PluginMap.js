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
import { defaultBasemaps } from '../../constants/basemaps';
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

        map.invalidateSize();

        const layersBounds = map.getLayersBounds();

        if (layersBounds.isValid) {
            map.fitBounds(layersBounds);
        }

        /* TODO
        if (Array.isArray(bounds)) {
            map.fitBounds(bounds);
        } else if (isNumeric(latitude) && isNumeric(longitude) && isNumeric(zoom)) {
            map.setView([latitude, longitude], zoom);
        }*/
     }

    componentDidUpdate(prevProps) {
        this.context.map.invalidateSize();
    }

    // Remove map
    componentWillUnmount() {
        this.context.map.remove();
    }

    render() {
        const { basemap = 'osmLight', overlays } = this.props;
        const selectedBasemap = defaultBasemaps.filter(map => map.id === basemap)[0];

        const style = {
            width: '100%',
            height: '100%',
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
                <Layer key='basemap' {...selectedBasemap} />
            </div>
        )
    }
}

export default PluginMap;
