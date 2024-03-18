import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import React from 'react'
import { openDownloadMode } from '../../util/history.js'
import styles from './styles/DownloadButton.module.css'

const DownloadButton = () => {
    return (
        <button
            className={cx(
                styles.button,
                'push-analytics-download-dropdown-menu-button'
            )}
            onClick={openDownloadMode}
        >
            {i18n.t('Download')}
        </button>
    )
}

export default DownloadButton
