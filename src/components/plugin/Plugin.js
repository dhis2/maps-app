import { useOnlineStatus } from '@dhis2/app-runtime'
import {
    CssReset,
    CssVariables,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { forwardRef, useState, useCallback, useEffect } from 'react'
import { drillUpDown } from '../../util/map.js'
import LayerLoader from '../loaders/LayerLoader.js'
import MapView from '../map/MapView.js'
import ContextMenu from './ContextMenu.js'
import Legend from './Legend.js'
import MapName from './MapName.js'
import styles from './styles/Plugin.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

const Plugin = forwardRef((props, ref) => {
    const { offline } = useOnlineStatus()
    const [mapViews, setMapViews] = useState(props.mapViews)
    const [contextMenu, setContextMenu] = useState()
    const [resizeCount, setResizeCount] = useState(0)

    const { name, basemap, hideTitle, controls, getResizeFunction } = props

    const onResize = () => setResizeCount((state) => state + 1)

    const onLayerLoad = useCallback(
        (layer) =>
            setMapViews((mapViews) =>
                mapViews.map((mapView) =>
                    layer.id === mapView.id ? layer : mapView
                )
            ),
        []
    )

    const onDrill = async (direction) => {
        const { layerId, feature } = contextMenu
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

            setMapViews(
                mapViews.map((layer) =>
                    layer.id === layerId ? newConfig : layer
                )
            )

            setContextMenu()
        }
    }

    // TODO: Remove when map.js is refactored
    useEffect(() => {
        if (getResizeFunction) {
            getResizeFunction(onResize)
        }
    }, [getResizeFunction])

    if (mapViews.find((layer) => !layer.isLoaded)) {
        return (
            <CenteredContent>
                <CircularLoader />
                {mapViews.map((config) => (
                    <LayerLoader
                        key={config.id}
                        config={config}
                        onLoad={onLayerLoad}
                    />
                ))}
            </CenteredContent>
        )
    }

    return (
        <div ref={ref} className={`dhis2-map-plugin ${styles.plugin}`}>
            <CssReset />
            <CssVariables colors spacers theme />
            {!hideTitle && <MapName name={name} />}
            <MapView
                isPlugin={true}
                isFullscreen={false}
                basemap={basemap}
                layers={mapViews}
                controls={controls}
                bounds={defaultBounds}
                openContextMenu={setContextMenu}
                resizeCount={resizeCount}
            />
            <Legend layers={mapViews} />
            {contextMenu && (
                <ContextMenu
                    {...contextMenu}
                    onDrill={onDrill}
                    onClose={() => setContextMenu()}
                    isOffline={offline}
                />
            )}
        </div>
    )
})

Plugin.displayName = 'Plugin'

Plugin.propTypes = {
    basemap: PropTypes.object,
    controls: PropTypes.array,
    getResizeFunction: PropTypes.func,
    hideTitle: PropTypes.bool,
    mapViews: PropTypes.array,
    name: PropTypes.string,
}

Plugin.defaultProps = {
    hideTitle: false,
}

export default Plugin
