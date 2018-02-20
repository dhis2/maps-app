import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d2map from 'dhis2-gis-api/build';
import ContextMenu from './PluginContextMenu';
import Layer from './Layer';
import EventLayer from './EventLayer';
import FacilityLayer from './FacilityLayer';
import ThematicLayer from './ThematicLayer';
import BoundaryLayer from './BoundaryLayer';
import EarthEngineLayer from './EarthEngineLayer';
import ExternalLayer from './ExternalLayer';
import { defaultBasemaps } from '../../constants/basemaps';
import { getMapAlerts } from '../../util/helpers'
import { drillUpDown } from '../../util/map';
import { fetchLayer } from '../../loaders/layers';

const layerType = {
    event:       EventLayer,
    facility:    FacilityLayer,
    thematic:    ThematicLayer,
    boundary:    BoundaryLayer,
    earthEngine: EarthEngineLayer,
    external:    ExternalLayer
};

const styles = {
    map: {
        width: '100%',
        height: '100%',
    },
    alerts: {
        padding: 20,
        fontSize: 12,
    },
    alert: {
        lineHeight: '16px',
        paddingBottom: 8,
    },
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

        this.map = d2map(div, {
            scrollWheelZoom: false,
        });

        this.state = {
            mapViews: props.mapViews, // Can be changed by drilling
        }
    }

    onRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        this.setState({
            contextMenuPosition: [evt.originalEvent.x, evt.originalEvent.pageY || evt.originalEvent.y],
        });
    }

    componentDidMount() {
        if (this.node && this.map) { // If map is rendered
            const { bounds, latitude, longitude, zoom } = this.props;
            const map = this.map;

            this.node.appendChild(map.getContainer()); // Append map container to DOM

            // Add zoom control
            map.addControl({
                type: 'zoom',
                position: 'topright',
            });

            if (map.legend) {
                this.legend = map.addControl({
                    type: 'legend',
                    offset: [0, -64],
                    content: map.legend,
                });
            }

            map.invalidateSize();

            const layersBounds = map.getLayersBounds();

            if (layersBounds.isValid()) {
                map.fitBounds(layersBounds);
            } else if (Array.isArray(bounds)) {
                map.fitBounds(bounds);
            } else if (latitude && longitude && zoom) {
                map.setView([latitude, longitude], zoom);
            } else {
                map.fitWorld();
            }

            map.invalidateSize();

            map.on('click', this.onCloseContextMenu, this);
        }
     }

    componentDidUpdate(prevProps) {
        const map = this.map;

        if (map) {
            map.invalidateSize();

            if (this.legend) {
                this.legend.setContent(map.legend);
            }
        }
    }

    // Remove map
    componentWillUnmount() {
        if (this.map) {
            this.map.remove();
        }
    }

    onOpenContextMenu(state) {
        this.setState(state);
    }

    onCloseContextMenu() {
        this.setState({
            position: null,
            feature: null,
        });
    }

    async onDrill(direction) {
        const { layerId, feature, mapViews } = this.state;
        let newConfig;

        if (layerId && feature) {
            const { level, id, parentGraph, grandParentId, grandParentParentGraph } = feature.properties;
            const layerConfig = mapViews.find(layer => layer.id === layerId);

            if (direction === 'up') {
                newConfig = drillUpDown(layerConfig, grandParentId, grandParentParentGraph, parseInt(level) - 1);
            } else {
                newConfig = drillUpDown(layerConfig, id, parentGraph, parseInt(level) + 1);
            }

            const newLayer = await fetchLayer(newConfig);

            this.map.legend = '';

            this.setState({
                mapViews: mapViews.map(layer => layer.id === layerId ? newLayer : layer),
                position: null,
                feature: null,
            });
        }
    }


    render() {
        const { basemap = { id: 'osmLight' } } = this.props;
        const { mapViews, position, feature } = this.state;

        let selectedBasemap;

        if (basemap.url) { // External layer
            selectedBasemap = {
                id: basemap.id,
                config: {
                    type: 'tileLayer',
                    ...basemap,
                },
            }
        } else {
            selectedBasemap = defaultBasemaps.find(map => map.id === (basemap.id || basemap));
        }

        const alerts = getMapAlerts(this.props);

        return (
            (!alerts.length ?
                <div ref={node => this.node = node} style={styles.map}>
                    {mapViews.filter(layer => layer.isLoaded).map((config) => {
                        const Overlay = layerType[config.layer] || Layer;

                        return (
                            <Overlay
                                key={config.id}
                                openContextMenu={this.onOpenContextMenu.bind(this)}
                                {...config}
                                isPlugin={true}
                            />
                        )
                    })}
                    <Layer key='basemap' {...selectedBasemap} />
                    <ContextMenu
                         position={position}
                         feature={feature}
                         // onClose={console.log}
                         onDrillDown={() => this.onDrill('down')}
                         onDrillUp={() => this.onDrill('up')}
                    />
                </div>
                :
                <div style={styles.alerts}>
                    {alerts.map((alert, index) =>
                        <div key={index} style={styles.alert}>
                            <strong>{alert.title}</strong>: {alert.description}
                        </div>
                    )}
                </div>
            )
        )
    }
}

PluginMap.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default PluginMap;
