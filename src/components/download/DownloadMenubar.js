import i18n from '@dhis2/d2-i18n'
import { Button, IconChevronLeft24, colors } from '@dhis2/ui'
import React, { useEffect } from 'react'
import history from '../../util/history.js'
import styles from './styles/DownloadMenubar.module.css'

const closeDownloadMode = () => {
    const rootPath = history.location.pathname.split('/download')[0]
    history.push(rootPath, { isDownloadClosing: true })
}

const DownloadMenubar = () => {
    useEffect(() => {
        const header = document.getElementsByTagName('header')[0]
        header.style.display = 'none'
        return () => {
            header.style.display = 'block'
        }
    }, [])

    return (
        <div className={styles.downloadModeMenu}>
            <Button onClick={closeDownloadMode}>
                <IconChevronLeft24 color={colors.grey700} />
                {i18n.t('Exit download mode')}
            </Button>
        </div>
    )
}

export default DownloadMenubar
