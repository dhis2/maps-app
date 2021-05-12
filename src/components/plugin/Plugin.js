import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CssReset, CssVariables } from '@dhis2/ui';
import MapName from './MapName';
import MapView from '../map/MapView';
import Legend from './Legend';
import ContextMenu from './ContextMenu';
import { drillUpDown } from '../../util/map';
import { fetchLayer } from '../../loaders/layers';
import styles from './styles/Plugin.module.css';

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
];

class Plugin extends Component {
    static propTypes = {
        hideTitle: PropTypes.bool,
        name: PropTypes.string,
        basemap: PropTypes.object,
        mapViews: PropTypes.array,
        controls: PropTypes.array,
    };

    static defaultProps = {
        hideTitle: false,
        basemap: { id: 'osmLight' },
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            isOnline: true,
            mapViews: props.mapViews, // Can be changed by drilling
            resizeCount: 0,
        };
    }

    render() {
        const { name, basemap, hideTitle, controls } = this.props;
        const {
            position,
            offset,
            feature,
            mapViews,
            resizeCount,
            isFullscreen,
            isOnline,
        } = this.state;

        return (
            <div className={`dhis2-map-plugin ${styles.plugin}`}>
                <CssReset />
                <CssVariables colors spacers theme />
                {!hideTitle && <MapName name={name} />}
                <MapView
                    isPlugin={true}
                    isFullscreen={isFullscreen}
                    basemap={basemap}
                    layers={mapViews}
                    controls={controls}
                    bounds={defaultBounds}
                    openContextMenu={this.onOpenContextMenu}
                    resizeCount={resizeCount}
                />
                <Legend layers={mapViews} />
                <ContextMenu
                    feature={feature}
                    position={position}
                    offset={offset}
                    onDrill={this.onDrill}
                    onClose={this.onCloseContextMenu}
                    isOnline={isOnline}
                />
            </div>
        );
    }

    // Call this method when plugin container is resized
    resize(isFullscreen) {
        // Will trigger a redraw of the MapView component
        this.setState(state => ({
            resizeCount: state.resizeCount + 1,
            isFullscreen,
        }));
    }

    setOnlineStatus(isOnline) {
        this.setState({ isOnline });
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

export default Plugin;
