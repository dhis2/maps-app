import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadPanel from '../download/DownloadPanel.js'
import MapLoadingMask from './MapLoadingMask.js'
import MapName from './MapName.js'
import MapView from './MapView.js'
import styles from './styles/MapContainer.module.css'

const MapContainer = () => {
    const [map, setMap] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const { basemap, newLayerIsLoading, coordinatePopup, mapViews, bounds } =
        useSelector((state) => state.map)
    const { downloadMode, showNorthArrow } = useSelector(
        (state) => state.download
    )
    const { layersPanelOpen, rightPanelOpen, dataTableHeight } = useSelector(
        (state) => state.ui
    )
    const dataTableOpen = useSelector((state) => !!state.dataTable)
    const interpretationModalOpen = useSelector(
        (state) => !!state.interpretation.id
    )
    const feature = useSelector((state) => state.feature)
    const basemapConfig = useBasemapConfig(basemap)
    const dispatch = useDispatch()

    const mapPosition = {
        top: HEADER_HEIGHT,
        left: layersPanelOpen || downloadMode ? LAYERS_PANEL_WIDTH : 0,
        right: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    }

    const layers = mapViews.filter((layer) => layer.isLoaded)
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length
    const isSplitView = !!getSplitViewLayer(layers)

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [
        layersPanelOpen,
        rightPanelOpen,
        dataTableOpen,
        dataTableHeight,
        downloadMode,
    ])

    // Fit layer bounds when download mode is toggled
    useEffect(() => {
        if (map) {
            map.getMapGL().once('resize', () =>
                map.fitBounds(map.getLayersBounds(), {
                    padding: 40,
                })
            )
        }
    }, [map, downloadMode])

    return (
        <div className={styles.mapPosition} style={mapPosition}>
            <div className={downloadMode ? styles.mapDownload : undefined}>
                <div
                    id="dhis2-map-container"
                    data-test="dhis2-map-container"
                    className={cx(styles.mapContainer, {
                        'dhis2-map-download': downloadMode,
                    })}
                >
                    {!downloadMode && <MapName />}
                    <MapView
                        isPlugin={false}
                        basemap={basemapConfig}
                        layers={layers}
                        bounds={bounds}
                        feature={feature}
                        openContextMenu={(config) =>
                            dispatch(openContextMenu(config))
                        }
                        coordinatePopup={coordinatePopup}
                        interpretationModalOpen={interpretationModalOpen}
                        closeCoordinatePopup={() =>
                            dispatch(closeCoordinatePopup())
                        }
                        setAggregations={(data) =>
                            dispatch(setAggregations(data))
                        }
                        resizeCount={resizeCount}
                        showNorthArrow={downloadMode && showNorthArrow}
                        setMapObject={setMap}
                    />
                    {downloadMode && map && (
                        <DownloadPanel
                            map={map.getMapGL()}
                            isSplitView={isSplitView}
                        />
                    )}
                    {isLoading && <MapLoadingMask />}
                </div>
            </div>
        </div>
    )
}

export default MapContainer
