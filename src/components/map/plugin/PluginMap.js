import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d2map from '@dhis2/gis-api';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { muiTheme } from '../../../constants/dhis2.theme';
import PluginLegend from './PluginLegend';
import ContextMenu from './PluginContextMenu';
import Layer from '../Layer';
import EventLayer from '../EventLayer';
import FacilityLayer from '../FacilityLayer';
import TrackedEntityLayer from '../TrackedEntityLayer';
import ThematicLayer from '../ThematicLayer';
import BoundaryLayer from '../BoundaryLayer';
import EarthEngineLayer from '../EarthEngineLayer';
import ExternalLayer from '../ExternalLayer';
// import { getMapAlerts } from '../../util/alerts';
import { drillUpDown } from '../../../util/map';
import { fetchLayer } from '../../../loaders/layers';

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

// TODO: Reuse code from Map.js
class PluginMap extends Component {
    getChildContext() {
        return {
            map: this.map,
        };
    }

    constructor(props, context) {
        super(props, context);

        // Create map div
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';

        this.map = d2map(div, {
            scrollWheelZoom: false,
        });

        // Add zoom control
        this.map.addControl({
            type: 'zoom',
            position: 'topright',
        });

        this.state = {
            mapViews: props.mapViews, // Can be changed by drilling
        };
    }

    onRightClick(evt) {
        L.DomEvent.stopPropagation(evt); // Don't propagate to map right-click

        this.setState({
            contextMenuPosition: [
                evt.originalEvent.x,
                evt.originalEvent.pageY || evt.originalEvent.y,
            ],
        });
    }

    componentDidMount() {
        if (this.node && this.map) {
            // If map is rendered
            const { bounds, latitude, longitude, zoom } = this.props;
            const map = this.map;

            this.node.appendChild(map.getContainer()); // Append map container to DOM

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

    componentDidUpdate() {
        if (this.map) {
            this.map.invalidateSize();
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
            const {
                level,
                id,
                parentGraph,
                grandParentId,
                grandParentParentGraph,
            } = feature.properties;
            const layerConfig = mapViews.find(layer => layer.id === layerId);

            if (direction === 'up') {
                newConfig = drillUpDown(
                    layerConfig,
                    grandParentId,
                    grandParentParentGraph,
                    parseInt(level) - 1
                );
            } else {
                newConfig = drillUpDown(
                    layerConfig,
                    id,
                    parentGraph,
                    parseInt(level) + 1
                );
            }

            const newLayer = await fetchLayer(newConfig);

            this.setState({
                mapViews: mapViews.map(
                    layer => (layer.id === layerId ? newLayer : layer)
                ),
                position: null,
                feature: null,
            });
        }
    }

    render() {
        const { basemap = { id: 'osmLight' } } = this.props;
        const { mapViews, position, feature } = this.state;

        // Disabled alerts as one layer without data will result in no map
        // No data warning added to legend instead
        const alerts = []; // getMapAlerts(this.props); // ADDED

        return (
            <MuiThemeProvider theme={muiTheme}>
                {!alerts.length ? (
                    <div ref={node => (this.node = node)} style={styles.map}>
                        {mapViews
                            .filter(layer => layer.isLoaded)
                            .map((config, index) => {
                                const Overlay =
                                    layerType[config.layer] || Layer;

                                return (
                                    <Overlay
                                        key={config.id}
                                        index={index}
                                        openContextMenu={this.onOpenContextMenu.bind(
                                            this
                                        )}
                                        {...config}
                                        isPlugin={true}
                                    />
                                );
                            })}
                        {basemap.isVisible !== false && (
                            <Layer key="basemap" {...basemap} />
                        )}
                        <PluginLegend layers={mapViews} />
                        <ContextMenu
                            position={position}
                            feature={feature}
                            onDrillDown={() => this.onDrill('down')}
                            onDrillUp={() => this.onDrill('up')}
                        />
                    </div>
                ) : (
                    <div style={styles.alerts}>
                        {alerts.map(alert => (
                            <div key={alert.id} style={styles.alert}>
                                <strong>{alert.title}</strong>:{' '}
                                {alert.description}
                            </div>
                        ))}
                    </div>
                )}
            </MuiThemeProvider>
        );
    }
}

PluginMap.childContextTypes = {
    map: PropTypes.object.isRequired,
};

export default PluginMap;
