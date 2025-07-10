import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLayersLoader } from '../../hooks/useLayersLoader.jsx'
import BottomPanel from '../datatable/BottomPanel.jsx'
import DownloadModeMenu from '../download/DownloadMenubar.jsx'
import DownloadSettings from '../download/DownloadSettings.jsx'
import LayersPanel from '../layers/LayersPanel.jsx'
import MapPosition from '../map/MapPosition.jsx'
import AppMenu from './AppMenu.jsx'
import DetailsPanel from './DetailsPanel.jsx'
import ModalContainer from './ModalContainer.jsx'
import './App.css'
import styles from './styles/App.module.css'
import { useLoadDataStore } from './useLoadDataStore.js'
import { useLoadMap } from './useLoadMap.js'

const App = () => {
    useEffect(() => {
        // Store the header height for height calculations
        const headerHeight = document
            .querySelector('header')
            .getBoundingClientRect().height

        document.documentElement.style.setProperty(
            '--header-height',
            `${headerHeight}px`
        )
    }, [])

    useLoadMap()
    useLoadDataStore()
    useLayersLoader()

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
            <ModalContainer />
        </>
    )
}

export default App
