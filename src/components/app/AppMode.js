import cx from 'classnames'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    HEADER_HEIGHT,
    LAYERS_PANEL_WIDTH,
    RIGHT_PANEL_WIDTH,
} from '../../constants/layout.js'
import { getSplitViewLayer } from '../../util/helpers.js'
import DownloadMode from '../download/DownloadMode.js'
import DownloadPanel from '../download/DownloadPanel.js'
import MapContainer from '../map/MapContainer.js'
import MainMode from './MainMode.js'
import styles from './styles/AppMode.module.css'

const MapMode = () => {
    const [map, setMap] = useState()
    const [resizeCount, setResizeCount] = useState(0)
    const downloadMode = useSelector((state) => state.download.downloadMode)
    const layers = useSelector((state) => state.map.mapViews)
    const { layersPanelOpen, rightPanelOpen, dataTableHeight } = useSelector(
        (state) => state.ui
    )
    const dataTableOpen = useSelector((state) => !!state.dataTable)
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
        downloadMode,
    ])

    // Fit layer bounds when app mode is toggled
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
        <>
            {downloadMode ? <DownloadMode /> : <MainMode />}
            <div className={styles.mapPosition} style={mapPosition}>
                <div className={downloadMode ? styles.mapDownload : undefined}>
                    <div
                        id="dhis2-map-container"
                        data-test="dhis2-map-container"
                        className={cx(styles.mapContainer, {
                            'dhis2-map-download': downloadMode,
                        })}
                    >
                        <MapContainer
                            resizeCount={resizeCount}
                            setMap={setMap}
                        />
                        {downloadMode && map && (
                            <DownloadPanel
                                map={map.getMapGL()}
                                isSplitView={isSplitView}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MapMode