import { Button } from '@dhis2/ui'
import React from 'react'
import { useDispatch } from 'react-redux'
import { toggleDownloadMode } from '../../actions/download.js'
import styles from './styles/DownloadModeMenu.module.css'

const DownloadModeMenu = () => {
    const dispatch = useDispatch()

    return (
        <div className={styles.downloadModeMenu}>
            <Button onClick={() => dispatch(toggleDownloadMode(false))}>
                Exit download mode
            </Button>
        </div>
    )
}

export default DownloadModeMenu
