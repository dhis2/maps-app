import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AlertStack from '../alerts/AlertStack.js'
import BottomPanel from '../datatable/BottomPanel.js'
import DownloadModeMenu from '../download/DownloadMenubar.js'
import DownloadSettings from '../download/DownloadSettings.js'
import LayerEdit from '../edit/LayerEdit.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersToggle from '../layers/LayersToggle.js'
import LayersLoader from '../loaders/LayersLoader.js'
import ContextMenu from '../map/ContextMenu.js'
import MapPosition from '../map/MapPosition.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'
import AppMenu from './AppMenu.js'
import DetailsPanel from './DetailsPanel.js'
import styles from './styles/AppLayout.module.css'

const AppLayout = () => {
    const [interpretationsRenderId, setInterpretationsRenderId] = useState(1)
    const detailsPanelOpen = useSelector(
        (state) => state.ui.rightPanelOpen && !state.orgUnitProfile
    )
    const dataTableOpen = useSelector((state) => !!state.dataTable)
    const openAsMapDialog = useSelector((state) => !!state.analyticalObject)

    const downloadMode = useSelector((state) => !!state.download.downloadMode)

    const onFileMenuAction = () =>
        detailsPanelOpen &&
        setInterpretationsRenderId(interpretationsRenderId + 1)

    if (downloadMode) {
        return (
            <>
                <div className={styles.downloadMode}>
                    <DownloadModeMenu />
                    <div className={styles.downloadContent}>
                        <DownloadSettings />
                        <div className={styles.downloadMap}>
                            <MapPosition />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div className={styles.appLayout}>
                <AppMenu onFileMenuAction={onFileMenuAction} />
                <div className={styles.content}>
                    <LayersPanel />
                    <div className={styles.mapAndTable}>
                        <MapPosition />
                        {dataTableOpen && <BottomPanel />}
                    </div>
                    <DetailsPanel
                        interpretationsRenderId={interpretationsRenderId}
                    />
                </div>
            </div>
            <LayersLoader />
            <LayersToggle />
            <ContextMenu />
            <LayerEdit />
            <AlertStack />
            {openAsMapDialog && <OpenAsMapDialog />}
        </>
    )
}

export default AppLayout
