import cx from 'classnames'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AlertStack from '../alerts/AlertStack.js'
import BottomPanel from '../datatable/BottomPanel.js'
import DownloadModeMenu from '../download/DownloadMenubar.js'
import DownloadSettings from '../download/DownloadSettings.js'
import LayerEdit from '../edit/LayerEdit.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersLoader from '../loaders/LayersLoader.js'
import ContextMenu from '../map/ContextMenu.js'
import MapPosition from '../map/MapPosition.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'
import AppMenu from './AppMenu.js'
import DetailsPanel from './DetailsPanel.js'
import './App.css'
import styles from './styles/App.module.css'
import { useLoadMap } from './useLoadMap.js'

// const getUrlParameter = (location, name) => {
//     const parsed = queryString.parse(location.search, { parseBooleans: true })
//     return parsed[name]
// }

// const getMapId = (hashLocation) => {
//     const pathParts = hashLocation.pathname.slice(1).split('/')
//     if (pathParts[0]) {
//         return pathParts[0]
//     }

//     // support /?id=ytkZY3ChM6J for backwards compatibility
//     return getUrlParameter(hashLocation, 'id')
// }

const App = () => {
    useLoadMap()
    const [interpretationsRenderCount, setInterpretationsRenderCount] =
        useState(1)

    const dataTableOpen = useSelector((state) => !!state.dataTable)
    const downloadModeOpen = useSelector(
        (state) => !!state.download.downloadMode
    )
    const detailsPanelOpen = useSelector(
        (state) => state.ui.rightPanelOpen && !state.orgUnitProfile
    )

    const onFileMenuAction = () =>
        detailsPanelOpen &&
        setInterpretationsRenderCount(interpretationsRenderCount + 1)

    return (
        <>
            {downloadModeOpen ? (
                <DownloadModeMenu />
            ) : (
                <AppMenu onFileMenuAction={onFileMenuAction} />
            )}
            <div
                className={cx(styles.content, {
                    [styles.downloadContent]: downloadModeOpen,
                })}
            >
                {downloadModeOpen ? <DownloadSettings /> : <LayersPanel />}
                <div className={styles.appMapAndTable}>
                    <MapPosition />
                    {dataTableOpen && <BottomPanel />}
                </div>
                {!downloadModeOpen && (
                    <DetailsPanel
                        interpretationsRenderCount={interpretationsRenderCount}
                    />
                )}
            </div>
            <LayersLoader />
            <ContextMenu />
            <LayerEdit />
            <AlertStack />
            <OpenAsMapDialog />
        </>
    )
}

export default App
