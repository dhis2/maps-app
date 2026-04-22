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
import MapView from '../map/MapView.jsx'
import ContextMenu from './ContextMenu.jsx'
import LayerLoader from './LayerLoader.jsx'
import Legend from './Legend.jsx'
import styles from './styles/Map.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

const Map = forwardRef((props, ref) => {
    const { basemap, mapViews, controls, getResizeFunction } = props

    const layers = useRef(
        mapViews.map((config) => ({ ...config, isLoaded: false }))
    )

    useEffect(() => {
        if (didViewsChange(layers.current, mapViews)) {
            layers.current = mapViews.map((v) => ({ ...v, isLoaded: false }))
            setMapIsLoaded(false)
            setVisibilityOverrides({})
        }
    }, [mapViews])

    const [mapIsLoaded, setMapIsLoaded] = useState(mapViews.length === 0)
    const [contextMenu, setContextMenu] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const [visibilityOverrides, setVisibilityOverrides] = useState({})

    const onResize = () => setResizeCount((state) => state + 1)

    const onLayerLoad = useCallback((layer) => {
        layers.current = layers.current.map((l) => {
            if (layer.id !== l.id) {
                return l
            }
            return { ...layer, isVisible: l.isVisible ?? true }
        })
        if (layers.current.every((l) => l.isLoaded)) {
            setMapIsLoaded(true)
        }
    }, [])

    const toggleLayerVisibility = useCallback((id) => {
        setVisibilityOverrides((prev) => {
            const layer = layers.current.find((l) => l.id === id)
            const current =
                prev[id] === undefined ? layer?.isVisible ?? true : prev[id]
            return { ...prev, [id]: !current }
        })
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

    const layersWithVisibility = layers.current.map((l) =>
        visibilityOverrides[l.id] === undefined
            ? l
            : { ...l, isVisible: visibilityOverrides[l.id] }
    )

    return (
        <div ref={ref} className={`dhis2-map-plugin ${styles.map}`}>
            <CssReset />
            <CssVariables colors spacers theme />
            <MapView
                isPlugin={true}
                isFullscreen={false}
                basemap={basemap}
                layers={layersWithVisibility}
                controls={controls}
                bounds={defaultBounds}
                openContextMenu={setContextMenu}
                resizeCount={resizeCount}
            />
            {mapViews.length > 0 && (
                <Legend
                    layers={layersWithVisibility}
                    toggleLayerVisibility={toggleLayerVisibility}
                />
            )}
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
