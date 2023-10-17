import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useDispatch } from 'react-redux'
import { setDownloadMode } from '../../actions/download.js'
import styles from './styles/DownloadButton.module.css'

const DownloadButton = () => {
    const dispatch = useDispatch()

    return (
        <button
            className={styles.button}
            onClick={() => dispatch(setDownloadMode(true))}
        >
            {i18n.t('Download')}
        </button>
    )
}

export default DownloadButton
