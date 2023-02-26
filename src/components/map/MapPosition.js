import cx from 'classnames'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadMapInfo from '../download/DownloadMapInfo.js'
import NorthArrow from '../download/NorthArrow.js'
import MapContainer from '../map/MapContainer.js'
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
    const layers = useSelector((state) => state.map.mapViews)
    const { layersPanelOpen, rightPanelOpen, dataTableHeight } = useSelector(
        (state) => state.ui
    )
    const dataTableOpen = useSelector((state) => !!state.dataTable)

    const downloadMapInfoOpen =
        downloadMode &&
        (showName ||
            showDescription ||
            (showLegend && !!showInLegend.length) ||
            showOverviewMap)

    const isSplitView = !!getSplitViewLayer(layers)

    const mapPosition = {
        top: HEADER_HEIGHT,
        left: layersPanelOpen || downloadMode ? LAYERS_PANEL_WIDTH : 0,
        right: rightPanelOpen ? RIGHT_PANEL_WIDTH : 0,
        bottom: dataTableOpen ? dataTableHeight : 0,
    }

    // Trigger map resize when panels are expanded, collapsed or dragged
    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [
        layersPanelOpen,
        rightPanelOpen,
        dataTableOpen,
        dataTableHeight,
        downloadMapInfoOpen,
    ])

    // Fit layer bounds when app mode is toggled
    useEffect(() => {
        if (map) {
            map.getMapGL().once('resize', () => {
                map.fitBounds(map.getLayersBounds(), {
                    padding: 40,
                })
            })

            setTimeout(() => map.resize(), 500)
        }
    }, [map, downloadMode])

    return (
        <div className={styles.mapPosition} style={mapPosition}>
            <div
                className={cx({
                    [styles.mapDownload]: downloadMode,
                    [styles.downloadMapInfoOpen]: downloadMapInfoOpen,
                })}
            >
                <div
                    id="dhis2-map-container"
                    data-test="dhis2-map-container"
                    className={cx(styles.mapContainer, {
                        'dhis2-map-download': downloadMode,
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
                            {showNorthArrow && (
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
