import { useDataEngine } from '@dhis2/app-runtime'
import {
    CssReset,
    CssVariables,
    CenteredContent,
    CircularLoader,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { forwardRef, useState, useCallback, useEffect } from 'react'
// import earthEngineLoader from '../../loaders/earthEngineLoader.js'
// import eventLoader from '../../loaders/eventLoader.js'
// import externalLoader from '../../loaders/externalLoader.js'
import facilityLoader from '../../loaders/facilityLoader.js'
import orgUnitLoader from '../../loaders/orgUnitLoader.js'
// import thematicLoader from '../../loaders/thematicLoader.js'
// import trackedEntityLoader from '../../loaders/trackedEntityLoader.js'
import { drillUpDown } from '../../util/map.js'
import MapView from '../map/MapView.js'
import { useSystemSettings } from '../SystemSettingsProvider.js'
import ContextMenu from './ContextMenu.js'
import Legend from './Legend.js'
import styles from './styles/Map.module.css'

const defaultBounds = [
    [-18.7, -34.9],
    [50.2, 35.9],
]

const loaders = {
    // earthEngine: EarthEngineLoader,
    // event: eventLoader,
    // external: externalLoader,
    facility: facilityLoader,
    orgUnit: orgUnitLoader,
    // thematic: thematicLoader,
    // trackedEntity: trackedEntityLoader,
}

const Map = forwardRef((props, ref) => {
    const [layers, setLayers] = useState([])
    const [contextMenu, setContextMenu] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const { keyAnalysisDisplayProperty: displayProperty } = useSystemSettings()
    const engine = useDataEngine()

    const { basemap, mapViews, controls, getResizeFunction } = props

    const onResize = () => setResizeCount((state) => state + 1)

    const onLayerLoaded = useCallback(
        (config) =>
            setLayers((layers) =>
                layers.map((l) => (config.id === l.id ? config : l))
            ),
        []
    )

    useEffect(() => {
        async function loadLayer(config, loader) {
            const loadedConfig = await loader({
                config,
                engine,
                displayProperty,
            })

            onLayerLoaded(loadedConfig)
        }

        mapViews.forEach((mapView) => {
            const loader = loaders[mapView.layer]

            if (!loader) {
                console.log('Could not find loader for layer', mapView)
                return
            }

            loadLayer(mapView, loader)
        })
    }, [mapViews, displayProperty, engine, onLayerLoaded])

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
                    layer.id === layerId
                        ? { ...newConfig, isLoaded: false }
                        : layer
                )
            )

            setContextMenu()
        }
    }

    if (layers.filter((l) => l.isLoaded).length < mapViews.length) {
        return (
            <CenteredContent>
                <CircularLoader />
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
