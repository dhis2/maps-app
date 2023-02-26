import { Button } from '@dhis2/ui'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setDownloadMode } from '../../actions/download.js'
import DownloadDialog from './DownloadDialog.js'
import styles from './styles/DownloadMode.module.css'

const DownloadMode = () => {
    const dispatch = useDispatch()

    return (
        <>
            <div className={styles.downloadModeMenu}>
                <Button onClick={() => dispatch(setDownloadMode(false))}>
                    Exit download mode
                </Button>
            </div>
            <DownloadDialog />
        </>
    )
}

export default DownloadMode
