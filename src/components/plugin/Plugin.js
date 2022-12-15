import { CssReset, CssVariables } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { fetchLayer } from '../../loaders/layers.js'
import { drillUpDown } from '../../util/map.js'
import MapView from '../map/MapView.js'
import ContextMenu from './ContextMenu.js'
import Legend from './Legend.js'
import MapName from './MapName.js'
import styles from './styles/Plugin.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

class Plugin extends Component {
    static propTypes = {
        basemap: PropTypes.object,
        controls: PropTypes.array,
        hideTitle: PropTypes.bool,
        mapViews: PropTypes.array,
        name: PropTypes.string,
    }

    static defaultProps = {
        hideTitle: false,
    }

    constructor(props, context) {
        super(props, context)

        this.state = {
            isOffline: false,
            mapViews: props.mapViews, // Can be changed by drilling
            resizeCount: 0,
        }
    }

    render() {
        const { name, basemap, hideTitle, controls } = this.props
        const {
            position,
            offset,
            feature,
            mapViews,
            resizeCount,
            isFullscreen,
            isSplitView,
            isOffline,
            container,
        } = this.state

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
                    isOffline={isOffline}
                    isSplitView={isSplitView}
                    container={container}
                />
            </div>
        )
    }

    // Call this method when plugin container is resized
    resize(isFullscreen) {
        // Will trigger a redraw of the MapView component
        this.setState((state) => ({
            resizeCount: state.resizeCount + 1,
            isFullscreen,
        }))
    }

    setOfflineStatus(isOffline) {
        this.setState({ isOffline })
    }

    onOpenContextMenu = (state) => this.setState(state)

    onCloseContextMenu = () =>
        this.setState({
            position: null,
            feature: null,
        })

    onDrill = async (direction) => {
        const { layerId, feature, mapViews } = this.state
        let newConfig

        if (layerId && feature) {
            const {
                level,
                id,
                parentGraph,
                grandParentId,
                grandParentParentGraph,
            } = feature.properties
            const layerConfig = mapViews.find((layer) => layer.id === layerId)

            if (direction === 'up') {
                newConfig = drillUpDown(
                    layerConfig,
                    grandParentId,
                    grandParentParentGraph,
                    parseInt(level) - 1
                )
            } else {
                newConfig = drillUpDown(
                    layerConfig,
                    id,
                    parentGraph,
                    parseInt(level) + 1
                )
            }

            const newLayer = await fetchLayer(newConfig)

            this.setState({
                mapViews: mapViews.map((layer) =>
                    layer.id === layerId ? newLayer : layer
                ),
                position: null,
                feature: null,
            })
        }
    }
}

export default Plugin
