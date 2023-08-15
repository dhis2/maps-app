// import cx from 'classnames'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import // APP_MENU_HEIGHT,
// HEADER_HEIGHT,
// DOWNLOAD_MENU_HEIGHT,
// LAYERS_PANEL_WIDTH,
// RIGHT_PANEL_WIDTH,
'../../constants/layout.js'
import DownloadMapInfo from '../download/DownloadMapInfo.js'
import NorthArrow from '../download/NorthArrow.js'
import MapPosition from '../map/MapPosition.js'
import styles from './styles/DownloadMapPage.module.css'

const DownloadMapPage = () => {
    const {
        downloadMode,
        showName,
        showDescription,
        showLegend,
        showInLegend,
        showOverviewMap,
        showNorthArrow,
    } = useSelector((state) => state.download)

    const downloadMapInfoOpen =
        downloadMode &&
        (showName ||
            showDescription ||
            (showLegend && !!showInLegend.length) ||
            showOverviewMap)

    // useEffect(() => {
    //     setResizeCount((count) => count + 1)
    // }, [downloadMapInfoOpen])

    return (
        <div className={styles.downloadMapPage}>
            <MapPosition />
            {map && (
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
    )
}

export default DownloadMapPage
