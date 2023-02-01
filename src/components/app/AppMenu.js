import React from 'react'
import { useSelector } from 'react-redux'
import DownloadButton from '../download/DownloadButton.js'
import DownloadModeMenu from '../download/DownloadModeMenu.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import FileMenu from './FileMenu.js'
import styles from './styles/AppMenu.module.css'

const AppMenu = () => {
    const downloadMode = useSelector((state) => state.download.downloadMode)

    return downloadMode ? (
        <DownloadModeMenu />
    ) : (
        <div className={styles.appMenu}>
            <AddLayerButton />
            <FileMenu />
            <DownloadButton />
            <InterpretationsToggle />
        </div>
    )
}

export default AppMenu
