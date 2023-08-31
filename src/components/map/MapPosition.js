import cx from 'classnames'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    APP_MENU_HEIGHT,
    HEADER_HEIGHT,
    // DOWNLOAD_MENU_HEIGHT,
    // LAYERS_PANEL_WIDTH,
    // RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadMapInfo from '../download/DownloadMapInfo.js'
import NorthArrow from '../download/NorthArrow.js'
import MapContainer from '../map/MapContainer.js'
import { useWindowDimensions } from '../WindowDimensionsProvider.js'
import styles from './styles/MapPosition.module.css'

const MapPosition = () => {
    const [map, setMap] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const {
        downloadMode,
        showName,
        showDescription,
        showLegend,
        showInLegend,
        showOverviewMap,
        showNorthArrow,
    } = useSelector((state) => state.download)
    const { id: mapId, mapViews: layers } = useSelector((state) => state.map)
    const { layersPanelOpen, rightPanelOpen, dataTableHeight } = useSelector(
        (state) => state.ui
    )
    const dataTableOpen = useSelector((state) => !!state.dataTable)

    const { height } = useWindowDimensions()

    let mapHeight = height - HEADER_HEIGHT - APP_MENU_HEIGHT
    if (dataTableOpen) {
        mapHeight = mapHeight - dataTableHeight
    } else if (downloadMode) {
        mapHeight = height - HEADER_HEIGHT
    }

    const downloadMapInfoOpen =
        downloadMode &&
        (showName ||
            showDescription ||
            (showLegend && !!showInLegend.length) ||
            showOverviewMap)

    const isSplitView = !!getSplitViewLayer(layers)

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [dataTableOpen, dataTableHeight, downloadMapInfoOpen])

    useEffect(() => {
        setTimeout(() => {
            setResizeCount((count) => count + 1)
        }, 100)
    }, [layersPanelOpen, rightPanelOpen])

    // Reset bearing and pitch when new map (mapId changed)
    useEffect(() => {
        if (map) {
            const mapgl = map.getMapGL()

            if (mapgl) {
                mapgl.setBearing(0)
                mapgl.setPitch(0)
            }
        }
    }, [map, mapId])

    // Fit layer bounds when app mode is toggled
    useEffect(() => {
        if (map) {
            const mapgl = map.getMapGL()

            mapgl.once('resize', () => {
                map.fitBounds(map.getLayersBounds(), {
                    padding: 40,
                    bearing: mapgl.getBearing(),
                })
            })

            setTimeout(() => {
                if (map.getMapGL()) {
                    map.resize()
                }
            }, 500)
        }
    }, [map, downloadMode])

    return (
        <div className={styles.mapPosition} style={{ height: mapHeight }}>
            <div
                className={cx({
                    [styles.mapDownload]: downloadMode,
                    [styles.downloadMapInfoOpen]: downloadMapInfoOpen,
                })}
            >
                <div
                    id="dhis2-map-container"
                    className={cx(styles.mapContainer, {
                        [styles.download]: downloadMode,
                    })}
                >
                    <MapContainer resizeCount={resizeCount} setMap={setMap} />
                    {downloadMode && map && (
                        <>
                            {downloadMapInfoOpen && (
                                <DownloadMapInfo
                                    map={map.getMapGL()}
                                    isSplitView={isSplitView}
                                />
                            )}
                            {showNorthArrow && !isSplitView && (
                                <NorthArrow
                                    map={map.getMapGL()}
                                    downloadMapInfoOpen={downloadMapInfoOpen}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MapPosition
