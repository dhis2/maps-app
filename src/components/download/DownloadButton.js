import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { openDownloadMode } from '../../util/history.js'
import styles from './styles/DownloadButton.module.css'

const DownloadButton = () => {
    return (
        <button className={styles.button} onClick={openDownloadMode}>
            {i18n.t('Download')}
        </button>
    )
}

export default DownloadButton
