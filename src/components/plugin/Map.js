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
import styles from './styles/Map.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

const Map = forwardRef((props, ref) => {
    const { offline } = useOnlineStatus()
    const [layers, setLayers] = useState([])
    const [contextMenu, setContextMenu] = useState()
    const [resizeCount, setResizeCount] = useState(0)

    const { basemap, mapViews, controls, getResizeFunction } = props

    const onResize = () => setResizeCount((state) => state + 1)

    const onLayerLoad = useCallback(
        (layer) =>
            setLayers((layers) =>
                layers.map((l) => (layer.id === l.id ? layer : l))
            ),
        []
    )

    useEffect(() => {
        setLayers(mapViews)
    }, [mapViews])

    // TODO: Remove when map.js is refactored
    useEffect(() => {
        if (getResizeFunction) {
            getResizeFunction(onResize)
        }
    }, [getResizeFunction])

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
            const layerConfig = layers.find((layer) => layer.id === layerId)

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

            setLayers(
                layers.map((layer) =>
                    layer.id === layerId ? newConfig : layer
                )
            )

            setContextMenu()
        }
    }

    if (layers.filter((l) => l.isLoaded).length < mapViews.length) {
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
        <div ref={ref} className={`dhis2-map-plugin ${styles.map}`}>
            <CssReset />
            <CssVariables colors spacers theme />
            <MapView
                isPlugin={true}
                isFullscreen={false}
                basemap={basemap}
                layers={layers}
                controls={controls}
                bounds={defaultBounds}
                openContextMenu={setContextMenu}
                resizeCount={resizeCount}
            />
            <Legend layers={layers} />
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

Map.displayName = 'PluginMap'

Map.propTypes = {
    basemap: PropTypes.object,
    controls: PropTypes.array,
    getResizeFunction: PropTypes.func,
    mapViews: PropTypes.array,
    name: PropTypes.string,
}

export default Map
