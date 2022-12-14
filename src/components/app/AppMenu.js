import React from 'react'
import DownloadButton from '../download/DownloadButton.js'
import InterpretationsToggle from '../interpretations/InterpretationsToggle.js'
import AddLayerButton from '../layers/overlays/AddLayerButton.js'
import FileMenu from './FileMenu.js'
import styles from './styles/AppMenu.module.css'

export const AppMenu = () => (
    <div className={styles.appMenu}>
        <AddLayerButton />
        <FileMenu />
        <DownloadButton />
        <InterpretationsToggle />
    </div>
)

export default AppMenu
