import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import styles from './styles/TrackerDataNotice.module.css'

// Shown next to options that load from the tracker API instead of analytics,
// which applies other access rules
const TrackerDataNotice = () => (
    <div className={styles.notice}>
        <NoticeBox info>
            {i18n.t(
                'With this option, tracked entities come from tracker data instead of analytics, so they depend on your data capture and search org units rather than your data output and analysis org units.'
            )}
        </NoticeBox>
    </div>
)

export default TrackerDataNotice
