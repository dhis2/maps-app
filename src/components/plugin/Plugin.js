import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ContextMenu from './ContextMenu';
import Map from '../map/Map';
import SplitView from '../map/SplitView';
import Legend from './Legend';
import { drillUpDown } from '../../util/map';
import { fetchLayer } from '../../loaders/layers';
import { pluginControls } from '../../constants/mapControls';

const styles = {
    root: {
        height: '100%',
        position: 'relative',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
};

class Plugin extends Component {
    static propTypes = {
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
        };
    }

    render() {
        const { basemap, classes } = this.props;
        const { position, feature, mapViews } = this.state;
        const splitViewLayer = mapViews.find(
            view => view.renderingStrategy === 'SPLIT_BY_PERIOD'
        );

        return (
            <div className={classes.root}>
                {splitViewLayer ? (
                    <SplitView
                        layer={splitViewLayer}
                        basemap={basemap}
                        openContextMenu={() => {}}
                    />
                ) : (
                    <Map
                        isPlugin={true}
                        basemap={basemap}
                        layers={mapViews}
                        controls={pluginControls}
                        openContextMenu={this.onOpenContextMenu}
                        onCloseContextMenu={this.onCloseContextMenu}
                    />
                )}
                <Legend layers={mapViews} />
                <ContextMenu
                    position={position}
                    feature={feature}
                    onDrill={this.onDrill}
                />
            </div>
        );
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
