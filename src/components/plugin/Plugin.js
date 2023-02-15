import { useOnlineStatus } from '@dhis2/app-runtime'
import { CssReset, CssVariables } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
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

const NO_MAP_VIEWS = []

const Plugin = ({
    name,
    basemap,
    mapViews: originalMapViews,
    hideTitle,
    controls,
}) => {
    const { offline } = useOnlineStatus()
    const [mapViews, setMapViews] = useState(NO_MAP_VIEWS)
    const [contextMenuState, setContextMenuState] = useState({})
    const [resizeCount] = useState(0)

    useEffect(() => {
        setMapViews(originalMapViews)
    }, [originalMapViews])

    const onOpenContextMenu = (newState) => {
        return setContextMenuState(newState)
    }

    const onCloseContextMenu = () =>
        setContextMenuState({
            position: null,
            feature: null,
        })

    const onDrill = async (direction) => {
        const { layerId, feature } = contextMenuState
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

            setMapViews(
                mapViews.map((layer) =>
                    layer.id === layerId ? newLayer : layer
                )
            )

            setContextMenuState({
                position: null,
                feature: null,
            })
        }
    }

    const { position, offset, feature, isSplitView, container } =
        contextMenuState

    return (
        <div className={`dhis2-map-plugin ${styles.plugin}`}>
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
                openContextMenu={onOpenContextMenu}
                resizeCount={resizeCount}
            />
            <Legend layers={mapViews} />
            <ContextMenu
                feature={feature}
                position={position}
                offset={offset}
                onDrill={onDrill}
                onClose={onCloseContextMenu}
                isOffline={offline}
                isSplitView={isSplitView}
                container={container}
            />
        </div>
    )
}

Plugin.propTypes = {
    basemap: PropTypes.object,
    controls: PropTypes.array,
    hideTitle: PropTypes.bool,
    mapViews: PropTypes.array,
    name: PropTypes.string,
}

Plugin.defaultProps = {
    hideTitle: false,
}

export default Plugin
