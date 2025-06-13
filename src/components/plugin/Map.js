import {
    CssReset,
    CssVariables,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, {
    forwardRef,
    useState,
    useCallback,
    useEffect,
    useRef,
} from 'react'
import { drillUpDown } from '../../util/map.js'
import { didViewsChange } from '../../util/pluginHelper.js'
import MapView from '../map/MapView.js'
import ContextMenu from './ContextMenu.js'
import LayerLoader from './LayerLoader.js'
import Legend from './Legend.js'
import styles from './styles/Map.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

const Map = forwardRef((props, ref) => {
    const { basemap, mapViews, controls, getResizeFunction } = props
    console.log('🚀 ~ Map ~ basemap:', basemap)

    const layers = useRef(
        mapViews.map((config) => ({ ...config, isLoaded: false }))
    )

    useEffect(() => {
        if (didViewsChange(layers.current, mapViews)) {
            layers.current = mapViews.map((v) => ({ ...v, isLoaded: false }))

            setMapIsLoaded(false)
        }
    }, [mapViews])

    const [mapIsLoaded, setMapIsLoaded] = useState(mapViews.length === 0)
    const [contextMenu, setContextMenu] = useState()
    const [resizeCount, setResizeCount] = useState(0)

    const onResize = () => setResizeCount((state) => state + 1)

    const onLayerLoad = useCallback((layer) => {
        layers.current = layers.current.map((l) =>
            layer.id === l.id ? layer : l
        )
        if (layers.current.every((l) => l.isLoaded)) {
            setMapIsLoaded(true)
        }
    }, [])

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
            const layerConfig = layers.current.find(
                (layer) => layer.id === layerId
            )

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

            layers.current = layers.current.map((layer) =>
                layer.id === layerId ? { ...newConfig, isLoaded: false } : layer
            )
            setMapIsLoaded(false)

            setContextMenu()
        }
    }

    if (!mapIsLoaded) {
        const layersToLoad = layers.current.filter(
            (config) => !config.isLoaded && !config.isLoading
        )
        layers.current = layers.current.map((layer) =>
            layersToLoad.find((l) => l.id === layer.id)
                ? { ...layer, isLoading: true }
                : layer
        )
        return (
            <CenteredContent>
                <CircularLoader />
                {layersToLoad.map((config) => (
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
                layers={layers.current}
                controls={controls}
                bounds={defaultBounds}
                openContextMenu={setContextMenu}
                resizeCount={resizeCount}
            />
            {mapViews.length > 0 && <Legend layers={layers.current} />}
            {contextMenu && (
                <ContextMenu
                    {...contextMenu}
                    onDrill={onDrill}
                    onClose={() => setContextMenu()}
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
