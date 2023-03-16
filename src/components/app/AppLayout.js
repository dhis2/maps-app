import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import AlertStack from '../alerts/AlertStack.js'
import BottomPanel from '../datatable/BottomPanel.js'
import DownloadMode from '../download/DownloadMode.js'
import LayerEdit from '../edit/LayerEdit.js'
import Interpretations from '../interpretations/Interpretations.js'
import LayersPanel from '../layers/LayersPanel.js'
import LayersToggle from '../layers/LayersToggle.js'
import LayersLoader from '../loaders/LayersLoader.js'
import ContextMenu from '../map/ContextMenu.js'
import MapPosition from '../map/MapPosition.js'
import OpenAsMapDialog from '../openAs/OpenAsMapDialog.js'
import OrgUnitProfile from '../orgunits/OrgUnitProfile.js'
import AppMenu from './AppMenu.js'
import styles from './styles/AppLayout.module.css'

const AppLayout = () => {
    const downloadMode = useSelector((state) => state.download.downloadMode)

    return (
        <div
            className={cx(styles.appLayout, {
                [styles.downloadMode]: downloadMode,
            })}
        >
            {downloadMode ? (
                <DownloadMode />
            ) : (
                <>
                    <AppMenu />
                    <LayersToggle />
                    <LayersPanel />
                    <LayersLoader />
                </>
            )}
            <MapPosition />
            <Interpretations />
            <BottomPanel />
            <LayerEdit />
            <ContextMenu />
            <AlertStack />
            <OpenAsMapDialog />
            <OrgUnitProfile />
        </div>
    )
}

export default AppLayout
