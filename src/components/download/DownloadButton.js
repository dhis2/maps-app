import i18n from '@dhis2/d2-i18n'
import React from 'react'
import history from '../../util/history.js'
import styles from './styles/DownloadButton.module.css'

const navigateToDownloadMode = () => {
    history.push(`${history.location.pathname}/download`, {
        isDownloadOpening: true,
    })
}

const DownloadButton = () => {
    return (
        <button className={styles.button} onClick={navigateToDownloadMode}>
            {i18n.t('Download')}
        </button>
    )
}

export default DownloadButton
