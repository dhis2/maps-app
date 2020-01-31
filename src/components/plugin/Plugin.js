import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MapName from './MapName';
import MapView from '../map/MapView';
import Legend from './Legend';
import ContextMenu from './ContextMenu';
import { drillUpDown } from '../../util/map';
import { fetchLayer } from '../../loaders/layers';

const styles = {
    root: {
        height: '100%',
        position: 'relative',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
};

const defaultBounds = [[-18.7, -34.9], [50.2, 35.9]];

class Plugin extends Component {
    static propTypes = {
        name: PropTypes.string,
        basemap: PropTypes.object,
        mapViews: PropTypes.array,
        classes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        basemap: { id: 'osmLight' },
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            mapViews: props.mapViews, // Can be changed by drilling
            resizeCount: 0,
        };
    }

    render() {
        const { name, basemap, classes } = this.props;
        const { position, feature, mapViews, resizeCount } = this.state;

        return (
            <div className={`dhis2-map-plugin ${classes.root}`}>
                <MapName name={name} />
                <MapView
                    isPlugin={true}
                    basemap={basemap}
                    layers={mapViews}
                    bounds={defaultBounds}
                    openContextMenu={this.onOpenContextMenu}
                    onCloseContextMenu={this.onCloseContextMenu}
                    resizeCount={resizeCount}
                />
                <Legend layers={mapViews} />
                <ContextMenu
                    position={position}
                    feature={feature}
                    onDrill={this.onDrill}
                />
            </div>
        );
    }

    // Call this method when plugin container is resized
    resize() {
        // Will trigger a redraw of the MapView component
        this.setState(state => ({ resizeCount: state.resizeCount + 1 }));
    }

    onOpenContextMenu = state => this.setState(state);

    onCloseContextMenu = () =>
        this.setState({
            position: null,
            feature: null,
        });

    onDrill = async direction => {
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
                mapViews: mapViews.map(layer =>
                    layer.id === layerId ? newLayer : layer
                ),
                position: null,
                feature: null,
            });
        }
    };
}

export default withStyles(styles)(Plugin);
