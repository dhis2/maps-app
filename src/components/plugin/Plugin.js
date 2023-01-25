import { useOnlineStatus } from '@dhis2/app-runtime'
import { CssReset, CssVariables } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { forwardRef, useState } from 'react'
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

const Plugin = forwardRef((props, ref) => {
    const { offline } = useOnlineStatus()
    const [mapViews, setMapViews] = useState(props.mapViews)
    const [contextMenu, setContextMenu] = useState({})
    const [resizeCount] = useState(0)

    const { name, basemap, hideTitle, controls } = props
    // const { position, offset, feature, isSplitView, container } = contextMenu

    /*    
    const onCloseContextMenu = () =>
        setContextMenuState({
            position: null,
            feature: null,
        })
    */

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

            const newLayer = await fetchLayer(newConfig)

            setMapViews(
                mapViews.map((layer) =>
                    layer.id === layerId ? newLayer : layer
                )
            )

            setContextMenu()
        }
    }

    // console.log('contextMenuState', contextMenu.ref, contextMenu)
    const { position, offset, feature, isSplitView, container } = contextMenu
    // {...contextMenu}

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
            <ContextMenu
                feature={feature}
                position={position}
                offset={offset}
                onDrill={onDrill}
                onClose={() => setContextMenu()}
                isOffline={offline}
                isSplitView={isSplitView}
                container={container}
            />
        </div>
    )
})

Plugin.displayName = 'Plugin'

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
