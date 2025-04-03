import cx from 'classnames'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadMapInfo from '../download/DownloadMapInfo.js'
import NorthArrow from '../download/NorthArrow.js'
import MapContainer from '../map/MapContainer.js'
import styles from './styles/MapPosition.module.css'

const MapPosition = () => {
    const [map, setMap] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const {
        showName,
        showDescription,
        showLegend,
        showInLegend,
        showOverviewMap,
        showNorthArrow,
    } = useSelector((state) => state.download)
    const { id: mapId, mapViews: layers } = useSelector((state) => state.map)
    const { downloadMode, layersPanelOpen, rightPanelOpen, dataTableHeight } =
        useSelector((state) => state.ui)
    const dataTableOpen = useSelector((state) => !!state.dataTable)

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
    }, [
        dataTableOpen,
        dataTableHeight,
        downloadMapInfoOpen,
        layersPanelOpen,
        rightPanelOpen,
    ])

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
        <div
            className={cx(styles.mapDefault, {
                [styles.mapDownload]: downloadMode,
                [styles.downloadMapInfoOpen]: downloadMapInfoOpen,
            })}
            style={
                dataTableOpen
                    ? {
                          height: `calc(100vh - var(--header-height) - var(--toolbar-height) - ${dataTableHeight}px)`,
                      }
                    : {}
            }
        >
            <div
                id="dhis2-map-container"
                className={cx(styles.mapContainer, {
                    [styles.download]: downloadMode,
                    'dhis2-map-download': downloadMode,
                    'dhis2-map-new': !mapId,
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
    )
}

export default MapPosition
