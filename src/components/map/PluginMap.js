import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d2map from 'dhis2-gis-api/src';
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

    getChildContext() {
        return {
            map: this.map
        };
    }

    constructor(props, context) {
        super(props, context)

        // Create map div
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';

        this.map = d2map(div);
    }

    componentWillMount() {
        // this.context.map.on('contextmenu', this.onRightClick, this);
    }

    componentDidMount() {
        const { bounds, latitude, longitude, zoom } = this.props;
        const map = this.map;

        this.node.appendChild(map.getContainer()); // Append map container to DOM

        // Add zoom control
        map.addControl({
            type: 'zoom',
            position: 'topright',
        });

        if (map.legend) {
            map.addControl({
                type: 'legend',
                offset: [0, -64],
                content: map.legend,
            });
        }

        map.invalidateSize();

        const layersBounds = map.getLayersBounds();

        if (layersBounds.isValid()) {
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
                            isPlugin={true}
                        />
                    )
                })}
                <Layer key='basemap' {...selectedBasemap} />
            </div>
        )
    }
}

PluginMap.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default PluginMap;
