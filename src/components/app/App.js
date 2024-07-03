import cx from 'classnames'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import BottomPanel from '../datatable/BottomPanel.js'
import DownloadModeMenu from '../download/DownloadMenubar.js'
import DownloadSettings from '../download/DownloadSettings.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersLoader from '../loaders/LayersLoader.js'
import MapPosition from '../map/MapPosition.js'
import AppMenu from './AppMenu.js'
import DetailsPanel from './DetailsPanel.js'
import ModalContainer from './ModalContainer.js'
import './App.css'
import styles from './styles/App.module.css'
import { useLoadMap } from './useLoadMap.js'

const App = () => {
    console.log('loadMap')
    useLoadMap()

    const [interpretationsRenderCount, setInterpretationsRenderCount] =
        useState(1)

    const dataTableOpen = useSelector((state) => !!state.dataTable)
    const downloadModeOpen = useSelector((state) => !!state.ui.downloadMode)
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
            <ModalContainer />
        </>
    )
}

export default App
